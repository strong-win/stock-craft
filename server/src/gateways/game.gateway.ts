import { tradeRequest } from './../../../app/src/modules/sockets/trade';
import { EffectService } from 'src/services/effect.service';
import {
  GAME_TIME_REQUEST,
  GAME_TIME_RESPONSE,
  ITEM_RESPONSE,
  TRADE_RESPONSE,
} from './events';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameService } from 'src/services/game.service';
import { StockService } from 'src/services/stock.service';
import { ItemService } from 'src/services/item.service';
import { PlayerService, PlayerState } from 'src/services/player.service';
import { TradeService } from 'src/services/trade.service';
import { DayChart } from 'src/dto/chart-response.dto';
import { TradeResponseDto } from 'src/dto/trade-response.dto';

@WebSocketGateway()
export class GameGateway {
  @WebSocketServer()
  private server: Server;

  constructor(
    private gamesService: GameService,
    private tradeService: TradeService,
    private stockService: StockService,
    private itemService: ItemService,
    private effectService: EffectService,
    private playerService: PlayerService,
  ) {}

  @SubscribeMessage(GAME_TIME_REQUEST)
  async handleTimeRequest(
    client: any,
    payload: { gameId: string },
  ): Promise<void> {
    const { gameId } = payload;
    const { room, prevTime, nextTime } = this.gamesService.updateTime(gameId);

    if (nextTime.day > 0 && nextTime.tick == 0) {
      // find items with moment on-infer
      const items = await this.itemService.findByGameIdAndTimeAndMoment(
        gameId,
        prevTime.week,
        prevTime.day,
        'on-infer',
      );
      // create stock by requests with items
      await this.stockService.createStock(gameId, nextTime.week, nextTime.day);

      // find items with moment now
      await this.effectService.useItems(
        gameId,
        prevTime.week,
        prevTime.day,
        'now',
      );

      // item response
      const playersState: PlayerState[] =
        this.playerService.findStateByGameId(gameId);

      playersState.forEach((playerState) => {
        const { clientId, option } = playerState;
        this.server.to(clientId).emit(ITEM_RESPONSE, option);
      });
    }

    let dayChart: DayChart;
    if (nextTime.day > 0 && nextTime.tick == 1) {
      // find day chart
      dayChart = await this.stockService.findDayChart(
        gameId,
        nextTime.week,
        nextTime.day,
      );
    }

    if (nextTime.day > 0 && nextTime.tick < 4) {
      // refresh trade
      const tradesResponse: TradeResponseDto[] =
        await this.tradeService.handleRefresh(
          gameId,
          nextTime.week,
          nextTime.day,
          nextTime.tick,
        );

      tradesResponse.map((tradeResponse) => {
        this.server
          .to(tradeResponse.clientId)
          .emit(TRADE_RESPONSE, tradeResponse);
      });
    }

    this.server.to(room).emit(GAME_TIME_RESPONSE, { time: nextTime, dayChart });
  }
}
