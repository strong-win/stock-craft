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
export class GamesService {
  private games: GameState[] = [];

  createGame(gameId: string, room: string) {
    this.games.push({ gameId, room, time: { week: 1, day: 0, tick: 1 } });
  }

  getTime(gameId: string): TimeState {
    return this.games.find((game) => game.gameId === gameId).time;
  }

  updateTime(gameId: string): {
    room: string;
    time: TimeState;
    timeChanged: TimeState;
  } {
    let room: string;
    let time: TimeState;
    let timeChanged: TimeState;

    for (const game of this.games) {
      if (game.gameId === gameId) {
        // get room, time
        room = game.room;
        time = game.time;
        timeChanged = this.nextTime(game.time);

        // update time
        game.time = timeChanged;
      }
    }
    return { room, time, timeChanged };
  }

  nextTime({ week, day, tick }: TimeState): TimeState {
    return tick !== 5
      ? { week: week, day: day, tick: tick + 1 }
      : day !== 5
      ? { week: week, day: day + 1, tick: 1 }
      : { week: week + 1, day: 0, tick: 1 };
  }
}
