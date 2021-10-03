import { timeDayTicksType } from './../gateways/chart.gateway';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stock, StockDocument } from 'src/schemas/stocks.schema';

@Injectable()
export class StocksService {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
  ) {}

  async findDayTicks(
    room: string,
    week: number,
    day: number,
  ): Promise<timeDayTicksType> {
    const stocks = await this.stockModel.find({ room, week, day }).exec();

    const dayTicks = [];
    for (const stock of stocks) {
      const { tick, ticker, corpName, price } = stock;

      if (dayTicks[tick - 1]) {
        dayTicks[tick - 1].push({ ticker, corpName, price });
      } else {
        dayTicks[tick - 1] = [{ ticker, corpName, price }];
      }
    }

    return { week, day, dayTicks };
  }

  async findPrice(
    room: string,
    week: number,
    day: number,
    tick: number,
    ticker: string,
  ): Promise<number> {
    const stock = await this.stockModel
      .findOne({ room, week, day, tick, ticker })
      .exec();
    return stock.price;
  }
}
