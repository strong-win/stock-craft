import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Corp, Game, GameDocument } from 'src/schemas/games.schema';
import {
  Asset,
  Player,
  PlayerDocument,
  PlayerInfo,
} from 'src/schemas/players.schema';

@Injectable()
export class JoinService {
  constructor(
    @InjectModel(Game.name) private gameModel: mongoose.Model<GameDocument>,
    @InjectModel(Player.name)
    private playerModel: mongoose.Model<PlayerDocument>,
    private configService: ConfigService,
  ) {}

  async createGame(
    room: string,
    players: Player[],
  ): Promise<{
    playersInfo: PlayerInfo[];
    gameInfo?: { gameId: string; corps: Corp[]; assets: Asset[] };
    start: boolean;
  }> {
    // check if all players are ready
    const readies: Player[] = players.filter(
      (player) => player.status === 'ready',
    );

    if (readies.length === players.length) {
      // get sample data
      const cash = 100_000;
      const corps: Corp[] = this.configService.get<Corp[]>('corps');
      const assets: Asset[] = corps.map(({ corpId }) => ({
        corpId,
        quantity: 0,
      }));

      // create game
      const { _id: gameId } = await this.gameModel.create({ room, corps });

      // update player
      await this.playerModel.updateMany(
        { room, status: 'ready' },
        {
          status: 'play',
          gameId,
          cash,
          assets,
        },
      );

      const playersInfo: PlayerInfo[] = players.map(({ name }) => ({
        name,
        status: 'play',
      }));
      return { playersInfo, gameInfo: { gameId, corps, assets }, start: true };
    } else {
      const playersInfo: PlayerInfo[] = players.map(({ name, status }) => ({
        name,
        status,
      }));
      return { playersInfo, start: false };
    }
  }
}
