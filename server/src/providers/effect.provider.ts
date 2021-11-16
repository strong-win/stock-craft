import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Stock, StockDocument } from 'src/schemas/stock.schema';
import { StockEffectStateProvider } from 'src/states/stock.effect.state';
import { PlayerStateProvider } from 'src/states/player.state';

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
    private playerState: PlayerStateProvider,
    private stockEffectState: StockEffectStateProvider,
  ) {}

  // example effectHandler (chatting ban)
  private effectHandler_0001: EffectHandler = async ({
    playerId,
    target,
    week,
    day,
  }) => {
    await this.playerState.updateWithEffect(playerId, target, week, day, {
      chatting: false,
    });
  };

  // example effectHandler (trade ban)
  private effectHandler_0002: EffectHandler = async ({
    playerId,
    target,
    week,
    day,
  }) => {
    await this.playerState.updateWithEffect(playerId, target, week, day, {
      trade: false,
    });
  };

  // example effectHandler (chart ban)
  private effectHandler_0003: EffectHandler = async ({
    playerId,
    target,
    week,
    day,
  }) => {
    await this.playerState.updateWithEffect(playerId, target, week, day, {
      chart: false,
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

    await this.stockEffectState.updateWithEffect(gameId, week, day, increment);
  };

  private effectHandler: { [key: string]: EffectHandler } = {
    '0001': this.effectHandler_0001,
    '0002': this.effectHandler_0002,
    '0003': this.effectHandler_0003,
    '0004': this.effectHandler_0004,
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
