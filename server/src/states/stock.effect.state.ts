import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

export type StockEffectState = {
  gameId: Types.ObjectId | string;
  corpId: string;
  week: number;
  day: number;
  increment: number;
  moment: 'now' | 'before-infer' | 'after-infer' | 'end';
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

  findStockEffects(gameId: Types.ObjectId | string, week: number, day: number) {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }

    return this.stockEffects.filter(
      (stock) =>
        gameId === stock.gameId && week === stock.week && day === stock.day,
    );
  }

  updateWithEffect(
    gameId: Types.ObjectId | string,
    week: number,
    day: number,
    increment: number,
  ): void {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }

    this.stockEffects.forEach((stock) => {
      if (gameId === stock.gameId && week === stock.week && day === stock.day) {
        stock.increment += increment;
      }
    });
  }
}
