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
import { PlayerEffectStateProvider } from 'src/states/player.effect.state';
import { ItemResponseDto } from 'src/dto/item-response.dto';

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
      this.tradeService
        .handleRefresh(gameId, nextTime.week, nextTime.day, nextTime.tick)
        .then((tradesResponseDtos: TradeResponseDto[]) => {
          tradesResponseDtos.forEach((tradeResponseDto) => {
            this.server
              .to(tradeResponseDto.clientId)
              .emit(TRADE_RESPONSE, tradeResponseDto);
          });
        });
    }

    // use item and generate chart
    if (nextTime.day > 0 && nextTime.tick == 0) {
      this.itemService
        .useItems(gameId, prevTime.week, prevTime.day, 'now')
        .then(() => {
          // response effect to player
          const itemResponseDtos: ItemResponseDto[] =
            this.playerEffectState.findPlayerEffects(
              gameId,
              prevTime.week,
              prevTime.day,
              'now',
            );

          itemResponseDtos.forEach((itemResponseDto: ItemResponseDto) => {
            this.server
              .to(itemResponseDto.clientId)
              .emit(ITEM_RESPONSE, itemResponseDto);
          });
        });

      // use item with moment before-infer
      this.itemService
        .useItems(gameId, prevTime.week, prevTime.day, 'before-infer')
        .then(async () => {
          const chartRequestDto: ChartRequestDto =
            await this.gameService.composeChartRequest(
              gameId,
              prevTime,
              nextTime,
            );

          // request chart to ML Server
          this.marketApi
            .requestChart(chartRequestDto)
            .then(async (chartResponseDto: ChartResponseDto) => {
              // use item with moment after-infer
              await this.itemService.useItems(
                gameId,
                prevTime.week,
                prevTime.day,
                'after-infer',
              );

              // response effect to player
              const itemResponseDtos: ItemResponseDto[] =
                this.playerEffectState.findPlayerEffects(
                  gameId,
                  prevTime.week,
                  prevTime.day,
                  'after-infer',
                );

              itemResponseDtos.forEach((itemResponseDto: ItemResponseDto) => {
                this.server
                  .to(itemResponseDto.clientId)
                  .emit(ITEM_RESPONSE, itemResponseDto);
              });
            });
        });
    }

    // calculate score
    if (nextTime.week > 0 && nextTime.day === 0 && nextTime.tick == 0) {
      this.gameService
        .calculateScore(gameId)
        .then((playerScores: PlayerScore[]) => {
          this.server.to(room).emit(GAME_SCORE, playerScores);
        });
    }
  }
}
