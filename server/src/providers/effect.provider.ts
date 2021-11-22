import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Stock, StockDocument } from 'src/schemas/stock.schema';
import { StockEffectStateProvider } from 'src/states/stock.effect.state';
import {
  Asset,
  Player,
  PlayerDocument,
  PlayerOption,
} from 'src/schemas/player.schema';
import { PlayerEffectStateProvider } from 'src/states/player.effect.state';

export type EffectRequest = {
  type: string;
  gameId?: Types.ObjectId | string;
  playerId: Types.ObjectId | string;
  target: string;
  week?: number;
  day?: number;
};

export type EffectHandlerParams = {
  gameId?: string;
  playerId: string;
  target: string;
  week?: number;
  day?: number;
};

type EffectHandler = ({
  gameId,
  playerId,
  target,
  week,
  day,
}: EffectHandlerParams) => Promise<void>;

@Injectable()
export class EffectProvider {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    private playerEffectState: PlayerEffectStateProvider,
    private stockEffectState: StockEffectStateProvider,
  ) {}

  private effectHandler_salary: EffectHandler = async ({
    gameId,
    playerId,
    week,
    day,
  }) => {
    const player: Player = await this.playerModel.findOne({
      _id: Types.ObjectId(playerId),
    });

    const increment = Math.floor(player.cash.totalCash * 0.05);
    const cash = player.cash;

    cash.totalCash += increment;
    cash.availableCash += increment;

    await this.playerModel.updateOne(
      { _id: Types.ObjectId(playerId) },
      { cash },
    );

    const message = {
      user: '관리자',
      text: `월급날 아이템 사용으로 현금의 5% 인 ${increment} 원 증가하였습니다.`,
      statuses: ['play'],
    };

    this.playerEffectState.updateOrCreate({
      gameId,
      playerId: player._id,
      clientId: player.clientId,
      week,
      day,
      cash,
      messages: [message],
      moment: 'now',
    });
  };

  private effectHandler_dividend: EffectHandler = async ({
    gameId,
    playerId,
    week,
    day,
  }) => {
    const NUM_STOCKS = 4; // actual NUM_STOCKS = 5
    const LAST_TICK = 3;

    const stocks: Stock[] = await this.stockModel
      .find({ game: Types.ObjectId(gameId), week, day, tick: LAST_TICK })
      .exec();

    if (stocks.length !== NUM_STOCKS) {
      const stockError = new Error('주가를 정상적으로 불러오지 못하였습니다.');
      stockError.name = 'stockException';
      throw stockError;
    }

    const prices: { [key: string]: number } = {};
    stocks.forEach((stock: Stock) => {
      prices[stock.corpId] = stock.price;
    });

    const player: Player = await this.playerModel.findOne({
      _id: Types.ObjectId(playerId),
    });

    let purchaseAmount = 0;
    player.assets.forEach((asset: Asset) => {
      if (prices[asset.corpId])
        purchaseAmount += prices[asset.corpId] * asset.totalQuantity;
    });

    const increment = Math.floor(purchaseAmount * 0.05);
    const cash = player.cash;

    cash.totalCash += increment;
    cash.availableCash += increment;

    await this.playerModel.updateOne(
      { _id: Types.ObjectId(playerId) },
      { cash },
    );

    const message = {
      user: '관리자',
      text: `배당금 아이템 사용으로 총 평가금액의 5% 인 ${increment} 원 증가하였습니다.`,
      statuses: ['play'],
    };

    this.playerEffectState.updateOrCreate({
      gameId,
      playerId: player._id,
      clientId: player.clientId,
      week,
      day,
      cash,
      messages: [message],
      moment: 'now',
    });
  };

  private effectHandler_short: EffectHandler = async ({
    gameId,
    target,
    week,
    day,
  }) => {
    const stock: Stock = await this.stockModel
      .find({ gameId: Types.ObjectId(gameId), corpId: target })
      .sort({ week: -1, day: -1, tick: -1 })
      .limit(1)[0];

    const increment = -stock.price * 0.2;

    this.stockEffectState.updateWithEffect(gameId, week, day, increment);
  };

  private effectHandler_long: EffectHandler = async ({
    gameId,
    target,
    week,
    day,
  }) => {
    const stock: Stock = await this.stockModel
      .find({ gameId: Types.ObjectId(gameId), corpId: target })
      .sort({ week: -1, day: -1, tick: -1 })
      .limit(1)[0];

    const increment = stock.price * 0.2;

    this.stockEffectState.updateWithEffect(gameId, week, day, increment);
  };

  private effectHandler: { [key: string]: EffectHandler } = {
    salary: this.effectHandler_salary,
    dividend: this.effectHandler_dividend,
    short: this.effectHandler_short,
    long: this.effectHandler_long,
  };

  async handleEffect({
    type,
    gameId,
    playerId,
    target,
    week,
    day,
  }: EffectRequest): Promise<void> {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }
    if (typeof playerId !== 'string') {
      playerId = playerId.toString();
    }

    await this.effectHandler[type]({ gameId, playerId, target, week, day });
  }
}
