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
import { TradeResponseDto } from 'src/dto/trade-response.dto';
import { DayChart } from 'src/dto/stock-response.dto';
import { MarketApi } from 'src/api/market.api';
import { ChartRequestDto } from 'src/dto/chart-request.dto';
import { ChartResponseDto } from 'src/dto/chart-response.dto';
import {
  PlayerEffectState,
  PlayerEffectStateProvider,
} from 'src/states/player.effect.state';

@WebSocketGateway()
export class GameGateway {
  @WebSocketServer()
  private server: Server;

  constructor(
    private gameState: GameStateProvider,
    private gameService: GameService,
    private tradeService: TradeService,
    private stockService: StockService,
    private itemService: ItemService,
    private playerEffectState: PlayerEffectStateProvider,
    private marketApi: MarketApi,
  ) {}

  @SubscribeMessage(GAME_TIME_REQUEST)
  async handleTimeRequest(
    client: any,
    payload: { gameId: string },
  ): Promise<void> {
    const { gameId } = payload;
    const { room, prevTime, nextTime } = this.gameState.updateTime(gameId);

    // find day chart
    let dayChart: DayChart;
    if (nextTime.day > 0 && nextTime.tick == 1) {
      dayChart = await this.stockService.findDayChart(
        gameId,
        nextTime.week,
        nextTime.day,
      );
    }

    this.server.to(room).emit(GAME_TIME_RESPONSE, { time: nextTime, dayChart });

    // refresh trade
    if (nextTime.day > 0 && nextTime.tick > 0 && nextTime.tick < 4) {
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

    // generate chart
    if (nextTime.day > 0 && nextTime.tick == 0) {
      await this.itemService.useItems(
        gameId,
        prevTime.week,
        prevTime.day,
        'now',
      );

      // response effect to player
      const playerEffects: PlayerEffectState[] =
        this.playerEffectState.findPlayerEffects(
          gameId,
          prevTime.week,
          prevTime.day,
          'now',
        );

      playerEffects.forEach((playerEffect: PlayerEffectState) => {
        this.server.to(playerEffect.clientId).emit(ITEM_RESPONSE, playerEffect);
      });

      // use item with moment before-infer
      await this.itemService.useItems(
        gameId,
        prevTime.week,
        prevTime.day,
        'before-infer',
      );

      const chartRequestDto: ChartRequestDto =
        await this.gameService.composeChartRequest(gameId, prevTime, nextTime);

      // request chart to ML Server
      this.marketApi
        .requestChart(chartRequestDto)
        .then(async (chartResponseDto: ChartResponseDto) => {
          console.log(
            `[CHART GENERATE RESPONSE] week : ${chartResponseDto.nextTime.week} day : ${chartResponseDto.nextTime.day}`,
          );

          // use item with moment after-infer
          await this.itemService.useItems(
            gameId,
            prevTime.week,
            prevTime.day,
            'after-infer',
          );

          // response effect to player
          const playerEffects: PlayerEffectState[] =
            this.playerEffectState.findPlayerEffects(
              gameId,
              prevTime.week,
              prevTime.day,
              'after-infer',
            );

          playerEffects.forEach((playerEffect: PlayerEffectState) => {
            this.server
              .to(playerEffect.clientId)
              .emit(ITEM_RESPONSE, playerEffect);
          });
        });
    }

    // calculate score
    if (nextTime.week > 0 && nextTime.day === 0 && nextTime.tick == 0) {
      const playerScores: PlayerScore[] = await this.gameService.calculateScore(
        gameId,
      );

      this.server.to(room).emit(GAME_SCORE, playerScores);
    }
  }
}
