import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Item, ItemDocument } from 'src/schemas/item.schema';
import { Player, PlayerDocument } from 'src/schemas/player.schema';
import { Stock, StockDocument } from 'src/schemas/stock.schema';
import { Trade, TradeDocument } from 'src/schemas/trade.schema';
import { GameService } from './game.service';
import { PlayerOption, PlayerService } from './player.service';

export type EffectRequest = {
  playerId: Types.ObjectId | string;
  type: string;
  target: string;
};

export type EffectResponse = {
  effect: any;
};

type EffectHandler = (
  playerId: string,
  target: string,
) => Promise<EffectResponse>;

@Injectable()
export class EffectService {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    @InjectModel(Trade.name) private tradeModel: Model<TradeDocument>,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    private gameSerivce: GameService,
    private playerService: PlayerService,
  ) {}

  // example effectHandler (chat ban)
  private effectHandler_0001: EffectHandler = async (playerId, target) => {
    const effect: PlayerOption = { category: 'chat', active: false };
    await this.playerService.updateStateByPlayerId(playerId, target, effect);
    return { effect };
  };

  private effectHandler_0002: EffectHandler = async (playerId, target) => {
    return null;
  };

  private effectHandler_0003: EffectHandler = async (playerId, target) => {
    return null;
  };

  private effectHandler: { [key: string]: EffectHandler } = {
    '0001': this.effectHandler_0001,
    '0002': this.effectHandler_0002,
    '0003': this.effectHandler_0003,
  };

  handleEffect({
    playerId,
    type,
    target,
  }: EffectRequest): Promise<EffectResponse> {
    if (typeof playerId !== 'string') {
      playerId = playerId.toString();
    }
    return this.effectHandler[type](playerId, target);
  }

  async useItems(
    gameId: string,
    week: number,
    day: number,
    moment: 'now' | 'on-infer' | 'after-infer' | 'end',
  ) {
    const items: Item[] = await this.itemModel
      .find({ game: Types.ObjectId(gameId), week, day, moment })
      .exec();

    // handle effect
    items.forEach((item) => {
      const isPlayer = (player: Types.ObjectId | Player): player is Player => {
        return (<Player>player)._id !== undefined;
      };

      if (!isPlayer(item.player)) {
        const typeGuardError = Error('타입이 일치하지 않습니다.');
        typeGuardError.name = 'TypeGuardError';
        throw typeGuardError;
      }

      this.handleEffect({
        playerId: item.player._id,
        type: item.type,
        target: item.target,
      });
    });
  }
}
