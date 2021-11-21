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
export class GameStateProvider {
  private games: GameState[] = [];

  createGameState(gameId: Types.ObjectId | string, room: string) {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }

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
    prevTime: TimeState;
    nextTime: TimeState;
  } {
    let room: string;
    let prevTime: TimeState;
    let nextTime: TimeState;

    for (const game of this.games) {
      if (game.gameId === gameId) {
        // get room, time
        room = game.room;
        prevTime = game.time;
        nextTime = this.getNextTime(game.time);

        // update time
        game.time = nextTime;
        game.date = new Date();
      }
    }
    return { room, prevTime, nextTime };
  }

  getNextTime({ week, day, tick }: TimeState): TimeState {
    if (day === 0) {
      return tick < 1
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
    const nextTime: TimeState = this.getNextTime(time);

    if (nextTime.tick === 0) {
      date.setSeconds(date.getSeconds() + 5);
    } else {
      date.setSeconds(date.getSeconds() + 15);
    }
    return date;
  }
}
