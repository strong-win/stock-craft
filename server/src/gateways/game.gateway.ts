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
import { StockService } from 'src/services/stock.service';
import { ItemService } from 'src/services/item.service';
import { TradeService } from 'src/services/trade.service';
import { TradeResponseDto } from 'src/dto/trade-response.dto';
import { GameStateProvider } from 'src/states/game.state.';
import { PlayerState, PlayerStateProvider } from 'src/states/player.state';

@WebSocketGateway()
export class GameGateway {
  @WebSocketServer()
  private server: Server;

  constructor(
    private gameState: GameStateProvider,
    private playerState: PlayerStateProvider,
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
    const { room, prevTime, nextTime } = this.gameState.updateTime(gameId);

    if (nextTime.day > 0 && nextTime.tick == 0) {
      // find items with moment on-infer
      const items = await this.itemService.findItems(
        gameId,
        prevTime.week,
        prevTime.day,
        'on-infer',
      );
      // create stock by requests with items
      // TODO - sample stock 생성을 ML Server 요청으로 변경
      await this.stockService.createStock(gameId, nextTime.week, nextTime.day);

      // find items with moment now
      await this.itemService.useItems(gameId, prevTime.week, prevTime.day);

      // item response
      const playerStates: PlayerState[] = this.playerState.findByGameId(gameId);

      playerStates.forEach((playerState) => {
        this.server
          .to(playerState.clientId)
          .emit(ITEM_RESPONSE, { option: playerState.option });
      });

      this.server.to(room).emit(GAME_TIME_RESPONSE, { time: nextTime });
    }

    if (nextTime.day > 0 && nextTime.tick == 1) {
      // find day chart
      const dayChart = await this.stockService.findDayChart(
        gameId,
        nextTime.week,
        nextTime.day,
      );

      this.server
        .to(room)
        .emit(GAME_TIME_RESPONSE, { time: nextTime, dayChart });
    }

    if (nextTime.day > 0 && nextTime.tick < 4) {
      // refresh trade
      const tradesResponseDtos: TradeResponseDto[] =
        await this.tradeService.handleRefresh(
          gameId,
          nextTime.week,
          nextTime.day,
          nextTime.tick,
        );

      tradesResponseDtos.forEach((tradeResponseDto) => {
        this.server
          .to(tradeResponseDto.clientId)
          .emit(TRADE_RESPONSE, tradeResponseDto);
      });

      this.server.to(room).emit(GAME_TIME_RESPONSE, { time: nextTime });
    }
  }
}
