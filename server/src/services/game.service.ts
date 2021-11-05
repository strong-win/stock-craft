import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

export type TimeState = {
  week: number;
  day: number;
  tick: number;
};

export type GameState = {
  gameId: string;
  room: string;
  time: TimeState;
  date?: Date;
};

@Injectable()
export class GameService {
  private games: GameState[] = [];

  createGame(gameId: string, room: string) {
    this.games.push({ gameId, room, time: { week: 1, day: 0, tick: 0 } });
  }

  getTime(gameId: Types.ObjectId | string): TimeState {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }
    return this.games.find((game) => game.gameId === gameId).time;
  }

  getRoom(gameId: Types.ObjectId | string): string {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }
    return this.games.find((game) => game.gameId === gameId).room;
  }

  updateTime(gameId: string): {
    room: string;
    timeChanged: TimeState;
  } {
    let room: string;
    let timeChanged: TimeState;

    for (const game of this.games) {
      if (game.gameId === gameId) {
        // get room, time
        room = game.room;
        timeChanged = this.getNextTime(game.time);

        // update time
        game.time = timeChanged;
        game.date = new Date();
      }
    }
    return { room, timeChanged };
  }

  getNextTime({ week, day, tick }: TimeState): TimeState {
    if (day === 0) {
      return tick < 2
        ? { week: week, day: day, tick: tick + 1 }
        : { week: week, day: day + 1, tick: 0 };
    }
    if (day === 5) {
      return tick < 4
        ? { week: week, day: day, tick: tick + 1 }
        : { week: week + 1, day: 0, tick: 0 };
    } else {
      return tick < 4
        ? { week: week, day: day, tick: tick + 1 }
        : { week: week, day: day + 1, tick: 0 };
    }
  }

  getNextDate(gameId: Types.ObjectId | string): Date {
    const game: GameState = this.games.find((game) => game.gameId === gameId);

    const { time, date } = game;
    const timeChanged: TimeState = this.getNextTime(time);

    if (timeChanged.tick === 0) {
      date.setSeconds(date.getSeconds() + 5);
    } else {
      date.setSeconds(date.getSeconds() + 15);
    }
    return date;
  }
}
