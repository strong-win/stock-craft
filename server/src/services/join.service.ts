import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { MarketApi } from 'src/api/market.api';
import { Corp, Game, GameDocument } from 'src/schemas/game.schema';
import {
  Asset,
  Cash,
  Player,
  PlayerDocument,
  PlayerInfo,
  PlayerStatus,
} from 'src/schemas/player.schema';
import { PlayerStateProvider } from 'src/states/player.state';

@Injectable()
export class JoinService {
  constructor(
    @InjectModel(Game.name) private gameModel: mongoose.Model<GameDocument>,
    @InjectModel(Player.name)
    private playerModel: mongoose.Model<PlayerDocument>,
    private playerState: PlayerStateProvider,
    private configService: ConfigService,
    private marketApi: MarketApi,
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
      // create game
      const { _id: gameId } = await this.gameModel.create({
        room,
        players,
      });

      // get start response from Market Server
      const corps = await this.marketApi.requestStart(gameId);

      // get player acccounts with corportions
      const { cash, assets } = this.getPlayerAccount(corps);

      // update player with accounts
      await this.playerModel.updateMany(
        { room, status: { $in: ['connected', 'ready'] } },
        {
          status: 'play',
          game: gameId,
          cash,
          assets,
        },
      );

      // create players state
      players.forEach((player) => {
        this.playerState.create(gameId, player._id, player.clientId);
      });

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

  getPlayerAccount(corps: Corp[]): { cash: Cash; assets: Asset[] } {
    const cash: Cash = {
      totalCash: 10_000_000,
      availableCash: 10_000_000,
    };
    const assets: Asset[] = corps.map(({ corpId }) => ({
      corpId,
      totalQuantity: 0,
      availableQuantity: 0,
      purchaseAmount: 0,
    }));

    return { cash, assets };
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
