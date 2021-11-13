import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChartRequestDto, TradeVolume } from 'src/dto/chart-request.dto';
import { Item, ItemDocument } from 'src/schemas/item.schema';
import { Trade, TradeDocument } from 'src/schemas/trade.schema';
import { GameStateProvider, TimeState } from 'src/states/game.state';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Trade.name) private tradeModel: Model<TradeDocument>,

    private gameState: GameStateProvider,
  ) {}
  async composeChartRequest(
    gameId: string,
    prevTime: TimeState,
    nextTime: TimeState,
  ): Promise<ChartRequestDto> {
    const items: Item[] = await this.itemModel
      .find({
        game: Types.ObjectId(gameId),
        week: prevTime.week,
        day: prevTime.day,
        moment: 'on-infer',
      })
      .exec();

    const trades: Trade[] = await this.tradeModel
      .find({ week: prevTime.week, day: prevTime.day, staus: 'pending' })
      .exec();

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
      itemTypes: items.map((item) => item.type),
      tradeVolume: tradeVolume,
    };
    return chartRequestDto;
  }
}
