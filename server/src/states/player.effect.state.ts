import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ItemResponseDto, Message } from 'src/dto/item-response.dto';
import {
  Asset,
  Cash,
  PlayerOption,
  PlayerSkill,
} from 'src/schemas/player.schema';

export type PlayerEffectState = {
  gameId: Types.ObjectId | string;
  playerId: Types.ObjectId | string;
  clientId: string;
  week: number;
  day: number;
  options?: PlayerOption;
  skills?: PlayerSkill;
  cash?: Cash;
  assets?: Asset[];
  messages?: Message[];
  moment: 'now' | 'before-infer' | 'after-infer' | 'end';
};

@Injectable()
export class PlayerEffectStateProvider {
  private playerEffects: PlayerEffectState[] = [];

  create({ gameId, playerId, clientId, week, day, moment }: PlayerEffectState) {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }
    if (typeof playerId !== 'string') {
      playerId = playerId.toString();
    }

    const options: PlayerOption = {
      chatoff: false,
      tradeoff: false,
    };

    const skills: PlayerSkill = {
      leverage: false,
    };

    this.playerEffects.push({
      gameId,
      playerId,
      clientId,
      week,
      day,
      options,
      skills,
      moment,
    });
  }

  update({
    gameId,
    playerId,
    week,
    day,
    options,
    skills,
    cash,
    assets,
    messages,
    moment,
  }: PlayerEffectState) {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }
    if (typeof playerId !== 'string') {
      playerId = playerId.toString();
    }

    this.playerEffects.forEach((playerEffect: PlayerEffectState) => {
      if (
        playerId === playerEffect.playerId &&
        week === playerEffect.week &&
        day === playerEffect.day &&
        moment === playerEffect.moment
      ) {
        if (options) playerEffect.options = options;
        if (skills) playerEffect.skills = skills;
        if (cash) playerEffect.cash = cash;
        if (assets) playerEffect.assets = assets;
        if (messages)
          playerEffect.messages = [...playerEffect.messages, ...messages];
      }
    });
  }

  findPlayerEffects(
    gameId: Types.ObjectId | string,
    week: number,
    day: number,
    moment: 'now' | 'before-infer' | 'after-infer' | 'end',
  ): ItemResponseDto[] {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }

    const itemResponseDtos: ItemResponseDto[] = this.playerEffects
      .filter(
        (player: PlayerEffectState) =>
          gameId === player.gameId &&
          week === player.week &&
          day === player.day &&
          moment === player.moment,
      )
      .map(
        ({
          clientId,
          options,
          skills,
          cash,
          assets,
          messages,
        }: PlayerEffectState) => ({
          clientId,
          options,
          skills,
          cash,
          assets,
          messages,
        }),
      );

    return itemResponseDtos;
  }
}
