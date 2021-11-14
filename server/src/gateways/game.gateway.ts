import {
  GAME_SCORE,
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
import { GameService, PlayerScore } from 'src/services/game.service';
import { StockService } from 'src/services/stock.service';
import { ItemService } from 'src/services/item.service';
import { TradeService } from 'src/services/trade.service';
import { GameStateProvider } from 'src/states/game.state';
import { PlayerState, PlayerStateProvider } from 'src/states/player.state';
import { TradeResponseDto } from 'src/dto/trade-response.dto';
import { DayChart } from 'src/dto/stock-response.dto';
import { MarketApi } from 'src/api/market.api';
import { ChartRequestDto } from 'src/dto/chart-request.dto';
import { ChartResponseDto } from 'src/dto/chart-response.dto';

@WebSocketGateway()
export class GameGateway {
  @WebSocketServer()
  private server: Server;

  constructor(
    private gameState: GameStateProvider,
    private playerState: PlayerStateProvider,
    private gameService: GameService,
    private tradeService: TradeService,
    private stockService: StockService,
    private itemService: ItemService,
    private marketApi: MarketApi,
  ) {}

  @SubscribeMessage(GAME_TIME_REQUEST)
  async handleTimeRequest(
    client: any,
    payload: { gameId: string },
  ): Promise<void> {
    const { gameId } = payload;
    const { room, prevTime, nextTime } = this.gameState.updateTime(gameId);

    if (nextTime.day > 0 && nextTime.tick == 0) {
      // find items with moment before-infer
      await this.itemService.useItemsBeforeInfer(
        gameId,
        prevTime.week,
        prevTime.day,
      );

      const chartRequestDto: ChartRequestDto =
        await this.gameService.composeChartRequest(gameId, prevTime, nextTime);

      this.marketApi
        .requestChart(chartRequestDto)
        .then((chartResponseDto: ChartResponseDto) => {
          console.log(
            `[CHART GENERATE RESPONSE] week : ${chartResponseDto.nextTime.week} day : ${chartResponseDto.nextTime.day}`,
          );

          // TO DO
          // - find items with moment after-infer
        });

      // find items with moment now
      await this.itemService.useItemsNow(gameId, prevTime.week, prevTime.day);

      // item response
      const playerStates: PlayerState[] = this.playerState.findByGameId(gameId);

      playerStates.forEach((playerState) => {
        this.server
          .to(playerState.clientId)
          .emit(ITEM_RESPONSE, { options: playerState.options });
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

    if (nextTime.day > 0 && nextTime.tick > 0 && nextTime.tick < 4) {
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
    }

    if (nextTime.week > 0 && nextTime.day === 0 && nextTime.tick == 0) {
      // calculate score
      const playerScores: PlayerScore[] = await this.gameService.calculateScore(
        gameId,
      );

      playerScores.forEach((playerScore) => {
        this.server.to(playerScore.clientId).emit(GAME_SCORE, playerScore);
      });
    }

    this.server.to(room).emit(GAME_TIME_RESPONSE, { time: nextTime, dayChart });
  }
}
