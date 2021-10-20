import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DayChart } from 'src/dto/chart-response.dto';

import { Stock, StockDocument } from 'src/schemas/stocks.schema';

type SampleStock = {
  week: number;
  day: number;
  tick: number;
  corpId: string;
  corpName: string;
  price: number;
};

@Injectable()
export class StocksService {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    private configService: ConfigService,
  ) {}

  async findDayChart(
    gameId: string,
    week: number,
    day: number,
  ): Promise<DayChart> {
    const stocks = await this.stockModel.find({ gameId, week, day }).exec();

    const dayChart = {};
    for (const stock of stocks) {
      const { tick, corpId, price } = stock;

      if (!dayChart[corpId]) {
        dayChart[corpId] = [{ tick, corpId, price }];
      } else {
        dayChart[corpId].push({ tick, corpId, price });
      }
    }

    for (const corpId in dayChart) {
      dayChart[corpId] = dayChart[corpId]
        .sort((a, b) => a.tick - b.tick)
        .map((tickChart) => tickChart.price);
    }
    return dayChart;
  }

  async findPrice(
    gameId: string,
    week: number,
    day: number,
    tick: number,
    corpId: string,
  ): Promise<number> {
    const stock = await this.stockModel.findOne({
      gameId,
      week,
      day,
      tick,
      corpId,
    });
    return stock.price;
  }

  // method to add sample stock
  async createStock(gameId: string, week: number, day: number) {
    const sampleCharts: SampleStock[] =
      this.configService.get<SampleStock[]>('stocks');

    const dayCharts: Stock[] = sampleCharts
      .filter((stock) => stock.week === week && stock.day === day)
      .map((stock) => ({ ...stock, gameId }));

    await this.stockModel.insertMany(dayCharts);
  }
}
