import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

export type StockEffectState = {
  gameId: Types.ObjectId | string;
  corpId: string;
  week: number;
  day: number;
  increment: number;
  moment: 'now' | 'before-infer' | 'after-infer';
};

@Injectable()
export class StockEffectStateProvider {
  private stockEffects: StockEffectState[] = [];

  create(
    gameId: Types.ObjectId | string,
    corpId: string,
    week: number,
    day: number,
    increment: number,
  ): void {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }

    this.stockEffects.push({
      gameId,
      corpId,
      week,
      day,
      increment,
      moment: 'before-infer',
    });
  }

  update(
    gameId: Types.ObjectId | string,
    corpId: string,
    week: number,
    day: number,
    increment: number,
  ): void {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }

    let flag = false;
    this.stockEffects.forEach((stock) => {
      if (
        gameId === stock.gameId &&
        corpId === stock.corpId &&
        week === stock.week &&
        day === stock.day
      ) {
        flag = true;
        stock.increment += increment;
      }
    });

    if (!flag) this.create(gameId, corpId, week, day, increment);
  }

  findStockEffects(gameId: Types.ObjectId | string, week: number, day: number) {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }

    return this.stockEffects.filter(
      (stock) =>
        gameId === stock.gameId && week === stock.week && day === stock.day,
    );
  }
}
