import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { dayChartType } from 'src/dto/chart-response.dto';
import { Stock, StockDocument } from 'src/schemas/stocks.schema';

type tickType = {
  tick: number;
  corpId: string;
  price: number;
};

@Injectable()
export class StocksService {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
  ) {}

  async findDayChart(
    room: string,
    week: number,
    day: number,
  ): Promise<dayChartType> {
    const stocks = await this.stockModel.find({ room, week, day }).exec();

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
        .sort((a: tickType, b: tickType) => a.tick - b.tick)
        .map((tickChart: tickType) => tickChart.price);
    }

    return dayChart;
  }

  async findPrice(
    room: string,
    week: number,
    day: number,
    tick: number,
    corpId: string,
  ): Promise<number> {
    const stock = await this.stockModel
      .findOne({ room, week, day, tick, corpId })
      .exec();
    return stock.price;
  }
}
