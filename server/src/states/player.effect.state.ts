import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Asset, Cash } from 'src/schemas/player.schema';
import { PlayerOption } from './player.state';

export type Chatting = {
  user: string;
  text: string;
  statuses: string[];
};

export type PlayerEffectState = {
  gameId: Types.ObjectId | string;
  playerId: Types.ObjectId | string;
  clientId: string;
  week: number;
  day: number;
  option?: PlayerOption;
  cash?: Cash;
  asset?: Asset;
  chattings?: Chatting[];
  moment: 'now' | 'before-infer' | 'after-infer' | 'end';
};

@Injectable()
export class PlayerEffectStateProvider {
  private playerEffects: PlayerEffectState[] = [];

  updateOrCreate({
    gameId,
    playerId,
    clientId,
    week,
    day,
    option,
    cash,
    asset,
    chattings,
    moment,
  }: PlayerEffectState) {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }
    if (typeof playerId !== 'string') {
      playerId = playerId.toString();
    }

    let flag = false;
    this.playerEffects.forEach((playerEffect: PlayerEffectState) => {
      if (
        playerId === playerEffect.playerId &&
        week === playerEffect.week &&
        day === playerEffect.day &&
        moment === playerEffect.moment
      ) {
        flag = true;

        if (option) playerEffect.option = option;
        if (cash) playerEffect.cash = cash;
        if (asset) playerEffect.asset = asset;
        if (chattings)
          playerEffect.chattings = [...playerEffect.chattings, ...chattings];
      }
    });

    if (!flag) {
      this.playerEffects.push({
        gameId,
        playerId,
        clientId,
        week,
        day,
        option,
        cash,
        asset,
        chattings,
        moment,
      });
    }
  }

  findPlayerEffects(
    gameId: Types.ObjectId | string,
    week: number,
    day: number,
    moment: 'now' | 'before-infer' | 'after-infer' | 'end',
  ) {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }

    return this.playerEffects.filter(
      (player: PlayerEffectState) =>
        gameId === player.gameId &&
        week === player.week &&
        day === player.day &&
        moment === player.moment,
    );
  }
}
