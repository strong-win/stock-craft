import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Corp, Game, GameDocument } from 'src/schemas/game.schema';
import {
  Asset,
  Cash,
  Player,
  PlayerDocument,
  PlayerOption,
  PlayerSkill,
  PlayerStatus,
  Role,
} from 'src/schemas/player.schema';

@Injectable()
export class JoinService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    @InjectModel(Player.name)
    private playerModel: Model<PlayerDocument>,
  ) {}

  async createGame(playerId: string, room: string): Promise<Types.ObjectId> {
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
      return gameId;
    }

    return null;
  }

  async initGame(
    gameId: Types.ObjectId | string,
    room: string,
    corps: Corp[],
  ): Promise<void> {
    if (typeof gameId === 'string') {
      gameId = Types.ObjectId(gameId);
    }

    const NUM_STOCKS = 4; // actual NUM_STOCKS = 5
    const IND_STOCK = Math.floor(Math.random() * NUM_STOCKS);

    // game
    await this.gameModel.updateOne(
      { _id: gameId },
      {
        corps: corps.map((corp: Corp, ind: number) =>
          ind === IND_STOCK
            ? { ...corp, target: true }
            : { ...corp, target: false },
        ),
      },
    );

    // players
    const players: Player[] = await this.playerModel
      .find({ room, status: { $in: ['connected', 'ready'] } })
      .exec();

    // give random role
    let NUM_INSTITUTIONAL = 1;
    let NUM_PARTY = 1;

    if (players.length >= 3) {
      while (NUM_INSTITUTIONAL) {
        const randNum = Math.floor(Math.random() * players.length);
        if (!players[randNum].role || players[randNum].role === 'individual') {
          NUM_INSTITUTIONAL -= 1;
          players[randNum].role = 'institutional';
        }
      }
    }

    if (players.length >= 4) {
      while (NUM_PARTY) {
        const randNum = Math.floor(Math.random() * players.length);
        if (!players[randNum].role || players[randNum].role === 'individual') {
          NUM_PARTY -= 1;
          players[randNum].role = 'party';
        }
      }
    }

    const assets: Asset[] = corps.map(({ corpId }) => ({
      corpId,
      totalQuantity: 0,
      availableQuantity: 0,
      purchaseAmount: 0,
    }));

    const options: PlayerOption = {
      chatoff: false,
      tradeoff: false,
    };

    const skills: PlayerSkill = {
      leverage: false,
      cloaking: '',
    };

    const individualIds = players
      .filter((player: Player) => !player.role)
      .map(({ _id }) => _id);

    await this.playerModel.updateMany(
      { _id: { $in: individualIds } },
      {
        status: 'play',
        game: gameId,
        role: 'individual',
        assets,
        cash: this.getCash('individual'),
        options,
        skills,
      },
    );

    const institutionalIds = players
      .filter((player: Player) => player.role === 'institutional')
      .map(({ _id }) => _id);

    await this.playerModel.updateMany(
      { _id: { $in: institutionalIds } },
      {
        status: 'play',
        game: gameId,
        role: 'institutional',
        assets,
        cash: this.getCash('institutional'),
        options,
        skills,
      },
    );

    const partyIds = players
      .filter((player: Player) => player.role === 'party')
      .map(({ _id }) => _id);

    await this.playerModel.updateMany(
      { _id: { $in: partyIds } },
      {
        status: 'play',
        role: 'party',
        game: gameId,
        assets,
        cash: this.getCash('party'),
        options,
        skills,
      },
    );
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

  getCash(role: Role): Cash {
    if (role === 'individual') {
      return {
        totalCash: 1_000_000,
        availableCash: 1_000_000,
      };
    } else if (role === 'institutional') {
      return {
        totalCash: 100_000_000,
        availableCash: 100_000_000,
      };
    } else {
      return {
        totalCash: 5_000_000,
        availableCash: 5_000_000,
      };
    }
  }
}
