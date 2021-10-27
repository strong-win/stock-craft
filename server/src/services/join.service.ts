import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Corp, Game, GameDocument } from 'src/schemas/game.schema';
import {
  Asset,
  Cash,
  Player,
  PlayerDocument,
  PlayerInfo,
  PlayerStatus,
} from 'src/schemas/player.schema';

@Injectable()
export class JoinService {
  constructor(
    @InjectModel(Game.name) private gameModel: mongoose.Model<GameDocument>,
    @InjectModel(Player.name)
    private playerModel: mongoose.Model<PlayerDocument>,
    private configService: ConfigService,
  ) {}

  async startGame(
    playerId: string,
    room: string,
  ): Promise<{
    playersInfo: PlayerInfo[];
    gameInfo?: { gameId: string; corps: Corp[]; assets: Asset[] };
    start: boolean;
  }> {
    const players: Player[] = await this.playerModel
      .find({
        room,
        status: { $in: this.getStatuses('all') },
      })
      .exec();

    // check if all players are ready
    const numHost: number = players.filter(
      (player) =>
        player.status === 'connected' && player._id.toString() === playerId,
    ).length;

    const numGuest: number = players.filter(
      (player) =>
        player.status === 'ready' && player._id.toString() !== playerId,
    ).length;

    if (numHost + numGuest === players.length) {
      const { cash, corps, assets } = this.getSampleData();

      // create game
      const { _id: gameId } = await this.gameModel.create({
        room,
        corps,
        players,
      });

      // update player
      await this.playerModel.updateMany(
        { room, status: { $in: ['connected', 'ready'] } },
        {
          status: 'play',
          game: gameId,
          cash,
          assets,
        },
      );

      const playersInfo: PlayerInfo[] = players.map(({ name }) => ({
        name,
        status: 'play',
      }));
      return {
        playersInfo,
        gameInfo: { gameId: gameId.toString(), corps, assets },
        start: true,
      };
    } else {
      const playersInfo: PlayerInfo[] = players.map(({ name, status }) => ({
        name,
        status,
      }));
      return { playersInfo, start: false };
    }
  }

  getSampleData() {
    // get sample data from config
    const cash: Cash = {
      totalCash: 100_000,
      availableCash: 100_000,
    };
    const corps: Corp[] = this.configService.get<Corp[]>('corps');
    const assets: Asset[] = corps.map(({ corpId }) => ({
      corpId,
      totalQuantity: 0,
      availableQuantity: 0,
    }));

    return { cash, corps, assets };
  }

  getStatuses(status: PlayerStatus | 'all'): PlayerStatus[] {
    if (status == 'all') {
      return ['connected', 'ready', 'play'];
    }
    if (status === 'connected' || status === 'ready') {
      return ['connected', 'ready'];
    }
    if (status === 'play') {
      return ['play'];
    }
  }
}
