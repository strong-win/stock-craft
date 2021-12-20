import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ChartRequestDto, CorpEvents } from 'src/dto/chart-request.dto';
import { Corp, Game, GameDocument } from 'src/schemas/game.schema';
import { Trade, TradeDocument } from 'src/schemas/trade.schema';
import { TimeState } from 'src/states/game.state';
import {
  Asset,
  Cash,
  Player,
  PlayerDocument,
  Role,
} from 'src/schemas/player.schema';
import {
  StockEffectState,
  StockEffectStateProvider,
} from 'src/states/stock.effect.state';
import { Stock, StockDocument } from 'src/schemas/stock.schema';
import { NUM_STOCKS } from 'src/constants';
import { PlayerEffectStateProvider } from 'src/states/player.effect.state';

export type PlayerScore = {
  playerId: Types.ObjectId;
  clientId: string;
  name: string;
  basic: number;
  bonus: number;
};

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    @InjectModel(Trade.name) private tradeModel: Model<TradeDocument>,
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,

    private stockEffectState: StockEffectStateProvider,
    private playerEffectState: PlayerEffectStateProvider,
  ) {}
  async composeChartRequest(
    gameId: string,
    prevTime: TimeState,
    nextTime: TimeState,
  ): Promise<ChartRequestDto> {
    const game: Game = await this.gameModel.findOne({
      _id: Types.ObjectId(gameId),
    });

    const stockEffectState: StockEffectState[] = this.stockEffectState.find(
      gameId,
      prevTime.week,
      prevTime.day,
    );

    const trades: Trade[] = await this.tradeModel
      .find({
        game: Types.ObjectId(gameId),
        week: prevTime.week,
        day: prevTime.day,
        status: 'disposed',
      })
      .exec();

    const corps: CorpEvents = {};

    game.corps.forEach(({ corpId }) => {
      corps[corpId] = {
        increment:
          stockEffectState.find((corpState) => corpId == corpState.corpId)
            ?.increment || 0,
        buyQuantity:
          trades
            .filter((trade) => corpId === trade.corpId && trade.deal === 'buy')
            .map((trade) => trade.quantity)
            .reduce((acc, cur) => acc + cur, 0) || 0,
        sellQuantity:
          trades
            .filter((trade) => corpId === trade.corpId && trade.deal === 'sell')
            .map((trade) => trade.quantity)
            .reduce((acc, cur) => acc + cur, 0) || 0,
      };
    });

    const chartRequestDto: ChartRequestDto = {
      gameId,
      prevTime,
      nextTime,
      corps,
    };
    return chartRequestDto;
  }

  async calculateScore(gameId: string): Promise<PlayerScore[]> {
    const game: Game = await this.gameModel
      .findOne({
        _id: Types.ObjectId(gameId),
      })
      .populate('players');

    if (!game) throw Error('플레이어를 정상적으로 불러오지 못하였습니다.');

    const stocks: Stock[] = await this.stockModel
      .find({ game: Types.ObjectId(gameId) })
      .sort({ week: -1, day: -1, tick: -1 })
      .limit(NUM_STOCKS)
      .exec();

    const prices: { [key: string]: number } = {};

    if (stocks.length) {
      stocks.forEach((stock: Stock) => {
        prices[stock.corpId] = stock.price;
      });
    } else {
      game.corps.forEach((corp: Corp) => {
        prices[corp.corpId] = corp.totalChart[corp.totalChart.length - 1];
      });
    }

    let individualSum = 0;

    const individualScores: PlayerScore[] = game.players
      .filter((player: Player) => player.role === 'individual')
      .map((player: Player) => {
        const stockCash: number = player.assets.reduce(
          (acc: number, cur: Asset) =>
            acc + prices[cur.corpId] * cur.totalQuantity,
          0,
        );

        const basic = player.cash.totalCash + stockCash;
        const profit = basic - this.getCash('individual').totalCash;
        individualSum += profit ? profit : 0;

        return {
          playerId: player._id,
          clientId: player.clientId,
          name: player.name,
          basic,
          bonus: 0,
        };
      });

    const institutionalScores: PlayerScore[] = game.players
      .filter((player: Player) => player.role === 'institutional')
      .map((player: Player) => {
        const stockCash: number = player.assets.reduce(
          (acc: number, cur: Asset) =>
            acc + prices[cur.corpId] * cur.totalQuantity,
          0,
        );

        const basic = Math.floor((player.cash.totalCash + stockCash) / 200);
        const bonus = individualSum;

        return {
          playerId: player._id,
          clientId: player.clientId,
          name: player.name,
          basic,
          bonus,
        };
      });

    const partyScores: PlayerScore[] = game.players
      .filter((player: Player) => player.role === 'party')
      .map((player: Player) => {
        const stockCash: number = player.assets.reduce(
          (acc: number, cur: Asset) =>
            acc + prices[cur.corpId] * cur.totalQuantity,
          0,
        );

        const targetCorp: Corp = game.corps.find((corp: Corp) => corp.target);
        const targetDiff = Math.abs(
          prices[targetCorp.corpId] - targetCorp.target,
        );

        const bonus = Math.floor(
          Math.pow(1 - targetDiff / targetCorp.target, 4) * 1_000_000,
        );
        const basic = Math.floor((player.cash.totalCash + stockCash) / 10);

        return {
          playerId: player._id,
          clientId: player.clientId,
          name: player.name,
          basic,
          bonus,
        };
      });

    const playerScores: PlayerScore[] = [
      ...individualScores,
      ...institutionalScores,
      ...partyScores,
    ];

    return playerScores;
  }

  async endGame(gameId: Types.ObjectId | string): Promise<void> {
    if (typeof gameId !== 'string') {
      gameId = gameId.toString();
    }

    await this.playerModel.updateMany(
      {
        game: Types.ObjectId(gameId),
        status: 'play',
      },
      { status: 'finish' },
    );

    this.playerEffectState.delete(gameId);
    this.stockEffectState.delete(gameId);
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
