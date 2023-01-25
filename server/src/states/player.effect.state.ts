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
  moment: 'now' | 'before-infer' | 'after-infer';
};

@Injectable()
export class PlayerEffectStateProvider {
  private playerEffects: PlayerEffectState[] = [];

  create({
    gameId,
    playerId,
    clientId,
    week,
    day,
    options,
    skills,
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

    this.playerEffects.push({
      gameId,
      playerId,
      clientId,
      week,
      day,
      options,
      skills,
      assets,
      messages,
      moment,
    });
  }

  update({
    gameId,
    playerId,
    clientId,
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

    let flag = false;
    this.playerEffects.forEach((playerEffect: PlayerEffectState) => {
      if (
        playerId === playerEffect.playerId &&
        week === playerEffect.week &&
        day === playerEffect.day &&
        moment === playerEffect.moment
      ) {
        flag = true;
        if (options) playerEffect.options = options;
        if (skills) playerEffect.skills = skills;
        if (cash) playerEffect.cash = cash;
        if (assets) playerEffect.assets = assets;
        if (messages)
          playerEffect.messages = playerEffect.messages
            ? [...playerEffect.messages, ...messages]
            : [...messages];
      }
    });

    if (!flag)
      this.create({
        gameId,
        playerId,
        clientId,
        week,
        day,
        options,
        skills,
        assets,
        messages,
        moment,
      });
  }

  find(
    gameId: Types.ObjectId | string,
    week: number,
    day: number,
    moment: 'now' | 'before-infer' | 'after-infer',
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

  delete(gameId: Types.ObjectId | string) {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }

    this.playerEffects = this.playerEffects.filter(
      (playerEffect: PlayerEffectState) => gameId !== playerEffect.gameId,
    );
  }
}
