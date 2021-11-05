import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from 'src/schemas/player.schema';
import { Stock, StockDocument } from 'src/schemas/stock.schema';
import { Trade, TradeDocument } from 'src/schemas/trade.schema';
import { GameService } from './game.service';
import { PlayerOption, PlayerService } from './player.service';

export type EffectRequest = {
  type: string;
  target: string;
};

export type EffectResponse = {
  state: any;
};

type EffectHandler = (target: string) => Promise<EffectResponse>;

@Injectable()
export class EffectService {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    @InjectModel(Trade.name) private tradeModel: Model<TradeDocument>,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    private gameSerivce: GameService,
    private playerService: PlayerService,
  ) {}

  // example effectHandler (chat ban)
  private effectHandler_0001: EffectHandler = async (target) => {
    const effect: PlayerOption = { type: 'chat', duration: 1 };
    const state = await this.playerService.updateOptionByPlayerId(
      target,
      effect,
    );
    return { state };
  };

  private effectHandler_0002: EffectHandler = async (target) => {
    return null;
  };

  private effectHandler_0003: EffectHandler = async (target) => {
    return null;
  };

  private effectHandler: { [key: string]: EffectHandler } = {
    '0001': this.effectHandler_0001,
    '0002': this.effectHandler_0002,
    '0003': this.effectHandler_0003,
  };

  handleEffect({ type, target }: EffectRequest): Promise<EffectResponse> {
    return this.effectHandler[type](target);
  }
}
