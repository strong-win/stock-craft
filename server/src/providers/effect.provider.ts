import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { PlayerStateProvider } from 'src/states/player.state';

export type EffectRequest = {
  playerId: Types.ObjectId | string;
  type: string;
  target: string;
};

type EffectHandler = (playerId: string, target: string) => Promise<void>;

@Injectable()
export class EffectProvider {
  constructor(private playerState: PlayerStateProvider) {}

  // example effectHandler (chatting ban)
  private effectHandler_0001: EffectHandler = async (playerId, target) => {
    await this.playerState.updateWithEffect(playerId, target, {
      category: 'chatting',
      active: false,
    });
  };

  // example effectHandler (trade ban)
  private effectHandler_0002: EffectHandler = async (playerId, target) => {
    await this.playerState.updateWithEffect(playerId, target, {
      category: 'trade',
      active: false,
    });
  };

  // example effectHandler (chart ban)
  private effectHandler_0003: EffectHandler = async (playerId, target) => {
    await this.playerState.updateWithEffect(playerId, target, {
      category: 'chart',
      active: false,
    });
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
