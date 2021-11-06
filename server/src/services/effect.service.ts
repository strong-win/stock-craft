import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  PlayerOption,
  PlayerRepository,
} from 'src/repositories/player.repository';

export type EffectRequest = {
  playerId: Types.ObjectId | string;
  type: string;
  target: string;
};

type EffectHandler = (playerId: string, target: string) => Promise<void>;

@Injectable()
export class EffectService {
  constructor(private playerRepository: PlayerRepository) {}

  // example effectHandler (chat ban)
  private effectHandler_0001: EffectHandler = async (playerId, target) => {
    const effect: PlayerOption = { category: 'chat', active: false };
    await this.playerRepository.updateWithEffect(playerId, target, effect);
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

  async handleEffect({ playerId, type, target }: EffectRequest): Promise<void> {
    if (typeof playerId !== 'string') {
      playerId = playerId.toString();
    }
    await this.effectHandler[type](playerId, target);
  }
}
