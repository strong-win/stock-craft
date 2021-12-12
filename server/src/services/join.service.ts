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
import { sampleSize } from 'lodash';
import { CORP_NAMES, NUM_STOCKS } from 'src/constants';

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
        player.status === 'ready' && player._id.toString() === playerId,
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
  ): Promise<Corp[]> {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }

    const sampleInd = Math.floor(Math.random() * NUM_STOCKS);
    const corpNames = sampleSize(CORP_NAMES, NUM_STOCKS);

    corps = corps.map((corp: Corp, ind: number) =>
      ind === sampleInd
        ? {
            ...corp,
            corpName: corpNames[ind],
            target: this.getTargetValue(corps, sampleInd),
          }
        : { ...corp, corpName: corpNames[ind], target: 0 },
    );

    // game
    await this.gameModel.updateOne({ _id: Types.ObjectId(gameId) }, { corps });

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

    const individualIds = players
      .filter((player: Player) => !player.role)
      .map(({ _id }) => _id);

    await this.playerModel.updateMany(
      { _id: { $in: individualIds } },
      {
        status: 'play',
        game: Types.ObjectId(gameId),
        role: 'individual',
        assets: this.getAssets(corps),
        cash: this.getCash('individual'),
        options: this.getOptions(),
        skills: this.getSkills(),
      },
    );

    const institutionalIds = players
      .filter((player: Player) => player.role === 'institutional')
      .map(({ _id }) => _id);

    await this.playerModel.updateMany(
      { _id: { $in: institutionalIds } },
      {
        status: 'play',
        game: Types.ObjectId(gameId),
        role: 'institutional',
        assets: this.getAssets(corps),
        cash: this.getCash('institutional'),
        options: this.getOptions(),
        skills: this.getSkills(),
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
        game: Types.ObjectId(gameId),
        assets: this.getAssets(corps),
        cash: this.getCash('party'),
        options: this.getOptions(),
        skills: this.getSkills(),
      },
    );

    return corps;
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

  getStockBase(price: number) {
    return price < 1_000
      ? 1
      : price < 5_000
      ? 5
      : price < 10_000
      ? 10
      : price < 50_000
      ? 50
      : price < 100_000
      ? 100
      : price < 500_000
      ? 500
      : 1_000;
  }

  getTargetValue(corps: Corp[], index: number): number {
    const totalChart = corps[index].totalChart;
    const lastValue = totalChart[totalChart.length - 1];

    const lower = Math.ceil(lastValue * 0.8);
    const upper = Math.floor(lastValue * 1.2);

    const price = Math.floor(Math.random() * (upper - lower)) + lower;
    const base = this.getStockBase(price);
    return base * Math.round(price / base);
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

  getAssets(corps: Corp[]): Asset[] {
    return corps.map(({ corpId }) => ({
      corpId,
      totalQuantity: 0,
      availableQuantity: 0,
      purchaseAmount: 0,
    }));
  }

  getOptions(): PlayerOption {
    return {
      chatoff: false,
      tradeoff: false,
    };
  }

  getSkills(): PlayerSkill {
    return {
      leverage: false,
      cloaking: '',
    };
  }
}
