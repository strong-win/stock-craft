import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DayChart } from 'src/dto/stock-response.dto';
import { Stock, StockDocument } from 'src/schemas/stock.schema';

type tickStock = {
  tick: number;
  corpId: string;
  price: number;
};

@Injectable()
export class StockService {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
  ) {}

  async findDayChart(
    gameId: string,
    week: number,
    day: number,
  ): Promise<DayChart> {
    const stocks = await this.stockModel
      .find({ game: Types.ObjectId(gameId), week, day })
      .exec();

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
        .sort((a: tickStock, b: tickStock) => a.tick - b.tick)
        .map((tickChart: tickStock) => tickChart.price);
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
      game: Types.ObjectId(gameId),
      week,
      day,
      tick,
      corpId,
    });
    return stock.price;
  }
}
