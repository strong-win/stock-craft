import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { ChartRequestDto, TradeVolume } from 'src/dto/chart-request.dto';
import { ChartResponseDto } from 'src/dto/chart-response.dto';
import { Corp } from 'src/schemas/game.schema';
import { Item } from 'src/schemas/item.schema';
import { Trade } from 'src/schemas/trade.schema';
import { TimeState } from 'src/states/game.state.';

@Injectable()
export class MarketApi {
  constructor(private httpService: HttpService) {}

  async requestStart(gameId: string): Promise<Corp[]> {
    return lastValueFrom(
      this.httpService
        .post('http://mock:8081/start', { gameId })
        .pipe(map((res) => res.data)),
    );
  }

  async requestChart(
    gameId: string,
    prevTime: TimeState,
    nextTime: TimeState,
    items: Item[],
    trades: Trade[],
  ): Promise<ChartResponseDto> {
    const itemTypes: string[] = items.map((item) => item.type);
    const tradeVolume: TradeVolume = {
      buyQuantity: trades
        .filter((trade) => trade.deal === 'buy' && trade.status == 'disposed')
        .map((trade) => trade.quantity)
        .reduce((acc, cur) => acc + cur, 0),
      sellQuantity: trades
        .filter((trade) => trade.deal === 'sell' && trade.status == 'disposed')
        .map((trade) => trade.quantity)
        .reduce((acc, cur) => acc + cur, 0),
    };

    const chartRequestDto: ChartRequestDto = {
      gameId,
      prevTime,
      nextTime,
      itemTypes,
      tradeVolume,
    };

    return lastValueFrom(
      this.httpService
        .post('http://mock:8081/chart', chartRequestDto)
        .pipe(map((res) => res.data)),
    );
  }
}
