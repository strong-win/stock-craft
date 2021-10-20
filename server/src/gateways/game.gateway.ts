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
import { GamesService, TimeState } from 'src/services/games.service';
import { DayChart } from 'src/dto/chart-response.dto';
import { PlayersService } from 'src/services/players.service';
import { TradesService } from 'src/services/trades.service';
import { TradeResponseDto } from 'src/dto/trade-response.dto';
import { StocksService } from 'src/services/stocks.service';
import { ItemsService } from 'src/services/items.service';

@WebSocketGateway()
export class GameGateway {
  @WebSocketServer()
  private server: Server;

  constructor(
    private gamesService: GamesService,
    private playersService: PlayersService,
    private tradesService: TradesService,
    private stocksService: StocksService,
    private itemsService: ItemsService,
  ) {}

  @SubscribeMessage(GAME_TIME_REQUEST)
  async handleMessage(client: any, payload: { gameId: string }): Promise<void> {
    const { gameId } = payload;
    const {
      room,
      time,
      timeChanged,
    }: { room: string; time: TimeState; timeChanged: TimeState } =
      this.gamesService.updateTime(gameId);

    if (
      time.tick !== timeChanged.tick &&
      timeChanged.day > 0 &&
      timeChanged.tick < 4
    ) {
      // find players
      const players = await this.playersService.findByGameIdAndStatuses(
        gameId,
        ['play'],
      );

      // TO DO - DB connection 횟수 축소 필요
      for (const player of players) {
        const { _id: playerId, gameId, clientId } = player;
        const tradeResponse: TradeResponseDto =
          await this.tradesService.handleRefresh({
            gameId,
            playerId,
            week: timeChanged.week,
            day: timeChanged.day,
            tick: timeChanged.tick,
          });

        if (tradeResponse)
          this.server.to(clientId).emit(TRADE_RESPONSE, tradeResponse);
      }
    }

    let dayChart: DayChart;
    // TO DO - timeChanged.day > 0 && timeChanged.tick === 5 로 조건 변경 필요
    if (time.day !== timeChanged.day && timeChanged.day > 0) {
      // find Items
      const items = await this.itemsService.findByGameIdAndTime(
        gameId,
        timeChanged.week,
        timeChanged.day,
      );
      // Create Stock By request with items
      await this.stocksService.createStock(
        gameId,
        timeChanged.week,
        timeChanged.day,
      );
      // find Day Chart
      dayChart = await this.stocksService.findDayChart(
        gameId,
        timeChanged.week,
        timeChanged.day,
      );
    }

    this.server
      .to(room)
      .emit(GAME_TIME_RESPONSE, { time: timeChanged, dayChart });
  }
}
