import { Injectable } from '@nestjs/common';

export type TimeState = {
  week: number;
  day: number;
  tick: number;
};

export type GameState = {
  gameId: string;
  room: string;
  time: TimeState;
};

@Injectable()
export class GameService {
  private games: GameState[] = [];

  createGame(gameId: string, room: string) {
    this.games.push({ gameId, room, time: { week: 1, day: 0, tick: 0 } });
  }

  getTime(gameId: string): TimeState {
    return this.games.find((game) => game.gameId === gameId).time;
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
        timeChanged = this.nextTime(game.time);

        // update time
        game.time = timeChanged;
      }
    }
    return { room, timeChanged };
  }

  nextTime({ week, day, tick }: TimeState): TimeState {
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
}
