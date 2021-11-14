import { Types } from 'mongoose';

export type CorpState = {
  gameId: Types.ObjectId | string;
  corpId: string;
  week: number;
  day: number;
  increment: number;
};

export class CorpStateProvider {
  private corps: CorpState[] = [];

  create(
    gameId: Types.ObjectId | string,
    corpId: string,
    increment: number,
    week: number,
    day: number,
  ): void {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }

    this.corps.push({ gameId, corpId, increment, week, day });
  }

  findByTarget(
    gameId: Types.ObjectId | string,
    target: string,
    week: number,
    day: number,
  ) {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }

    return this.corps.find(
      (stock) =>
        gameId === stock.gameId &&
        target === stock.corpId &&
        week === stock.week &&
        day === stock.day,
    );
  }

  findByGameId(gameId: Types.ObjectId | string, week: number, day: number) {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }

    return this.corps.filter(
      (stock) =>
        gameId === stock.gameId && week === stock.week && day === stock.day,
    );
  }

  async updateWithEffect(
    gameId: Types.ObjectId | string,
    week: number,
    day: number,
    increment: number,
  ): Promise<void> {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }

    this.corps.forEach((stock) => {
      if (gameId === stock.gameId && week === stock.week && day === stock.day) {
        stock.increment += increment;
      }
    });
  }
}
