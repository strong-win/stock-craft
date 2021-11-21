import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Stock, StockDocument } from 'src/schemas/stock.schema';
import { StockEffectStateProvider } from 'src/states/stock.effect.state';
import {
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

  // example effectHandler (chatting ban)
  private effectHandler_0001: EffectHandler = async ({
    gameId,
    target,
    week,
    day,
  }) => {
    const player: Player = await this.playerModel.findOne({
      _id: Types.ObjectId(target),
    });

    const options: PlayerOption = player.options;
    options.chatting = false;

    await this.playerModel.updateOne(
      { _id: Types.ObjectId(target) },
      { options },
    );

    this.playerEffectState.updateOrCreate({
      gameId,
      playerId: player._id,
      clientId: player.clientId,
      week,
      day,
      options,
      moment: 'now',
    });
  };

  // example effectHandler (trade ban)
  private effectHandler_0002: EffectHandler = async ({
    gameId,
    target,
    week,
    day,
  }) => {
    const player: Player = await this.playerModel.findOne({
      _id: Types.ObjectId(target),
    });

    const options: PlayerOption = player.options;
    options.trade = false;

    await this.playerModel.updateOne(
      { _id: Types.ObjectId(target) },
      { options },
    );

    this.playerEffectState.updateOrCreate({
      gameId,
      playerId: player._id,
      clientId: player.clientId,
      week,
      day,
      options,
      moment: 'now',
    });
  };

  // example effectHandler (chart ban)
  private effectHandler_0003: EffectHandler = async ({
    gameId,
    target,
    week,
    day,
  }) => {
    const player: Player = await this.playerModel.findOne({
      _id: Types.ObjectId(target),
    });

    const options: PlayerOption = player.options;
    options.chart = false;

    await this.playerModel.updateOne(
      { _id: Types.ObjectId(target) },
      { options },
    );

    this.playerEffectState.updateOrCreate({
      gameId,
      playerId: player._id,
      clientId: player.clientId,
      week,
      day,
      options,
      moment: 'now',
    });
  };
  // example effectHandler (stock price rise 20%)
  private effectHandler_0004: EffectHandler = async ({
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
      text: `월급날 아이템 사용으로 현금이 ${increment} 원 증가하였습니다.`,
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

  private effectHandler: { [key: string]: EffectHandler } = {
    // example
    '0001': this.effectHandler_0001,
    '0002': this.effectHandler_0002,
    '0003': this.effectHandler_0003,
    '0004': this.effectHandler_0004,

    // real
    salary: this.effectHandler_salary,
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
