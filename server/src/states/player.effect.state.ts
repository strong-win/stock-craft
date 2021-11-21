import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ItemResponseDto, Message } from 'src/dto/item-response.dto';
import { Asset, Cash, PlayerOption } from 'src/schemas/player.schema';

export type PlayerEffectState = {
  gameId: Types.ObjectId | string;
  playerId: Types.ObjectId | string;
  clientId: string;
  week: number;
  day: number;
  options?: PlayerOption;
  cash?: Cash;
  assets?: Asset[];
  messages?: Message[];
  moment: 'now' | 'before-infer' | 'after-infer' | 'end';
};

@Injectable()
export class PlayerEffectStateProvider {
  public playerEffects: PlayerEffectState[] = [];

  updateOrCreate({
    gameId,
    playerId,
    clientId,
    week,
    day,
    options,
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
        if (cash) playerEffect.cash = cash;
        if (assets) playerEffect.assets = assets;
        if (messages)
          playerEffect.messages = [...playerEffect.messages, ...messages];
      }
    });

    if (!flag) {
      this.playerEffects.push({
        gameId,
        playerId,
        clientId,
        week,
        day,
        options,
        cash,
        assets,
        messages,
        moment,
      });
    }
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
        ({ clientId, options, cash, assets, messages }: PlayerEffectState) => ({
          clientId,
          options,
          cash,
          assets,
          messages,
        }),
      );

    return itemResponseDtos;
  }
}
