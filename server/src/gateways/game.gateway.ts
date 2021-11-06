import {
  GAME_TIME_REQUEST,
  GAME_TIME_RESPONSE,
  TRADE_RESPONSE,
} from './events';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameService } from 'src/services/game.service';
import { DayChart } from 'src/dto/chart-response.dto';
import { TradeService } from 'src/services/trade.service';
import { TradeResponseDto } from 'src/dto/trade-response.dto';
import { StockService } from 'src/services/stock.service';
import { ItemService } from 'src/services/item.service';

@WebSocketGateway()
export class GameGateway {
  @WebSocketServer()
  private server: Server;

  constructor(
    private gamesService: GameService,
    private tradeService: TradeService,
    private stockService: StockService,
    private itemService: ItemService,
  ) {}

  @SubscribeMessage(GAME_TIME_REQUEST)
  async handleTimeRequest(
    client: any,
    payload: { gameId: string },
  ): Promise<void> {
    const { gameId } = payload;
    const { room, timeChanged } = this.gamesService.updateTime(gameId);

    if (timeChanged.day > 0 && timeChanged.tick == 0) {
      // find items
      const items = await this.itemService.findByGameIdAndTime(
        gameId,
        timeChanged.week,
        timeChanged.day,
      );
      // create stock by requests with items
      await this.stockService.createStock(
        gameId,
        timeChanged.week,
        timeChanged.day,
      );
    }

    let dayChart: DayChart;
    if (timeChanged.day > 0 && timeChanged.tick == 1) {
      // find day chart
      dayChart = await this.stockService.findDayChart(
        gameId,
        timeChanged.week,
        timeChanged.day,
      );
    }

    if (timeChanged.day > 0 && timeChanged.tick < 4) {
      // refresh trade
      const tradesResponse: TradeResponseDto[] =
        await this.tradeService.handleRefresh(
          gameId,
          timeChanged.week,
          timeChanged.day,
          timeChanged.tick,
        );

      for (const tradeResponse of tradesResponse) {
        this.server
          .to(tradeResponse.clientId)
          .emit(TRADE_RESPONSE, tradeResponse);
      }
    }

    this.server
      .to(room)
      .emit(GAME_TIME_RESPONSE, { time: timeChanged, dayChart });
  }
}
