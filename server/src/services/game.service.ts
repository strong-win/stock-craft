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
  name: string;
  score: number;
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
    const game: Game = await this.gameModel.findOne({
      _id: Types.ObjectId(gameId),
    });

    const stocks: Stock[] = await this.stockModel
      .find({ game: Types.ObjectId(gameId) })
      .sort({ week: -1, day: -1, tick: -1 })
      .limit(NUM_STOCKS)
      .exec();

    if (stocks.length !== NUM_STOCKS) {
      const stockError = new Error('주가를 정상적으로 불러오지 못하였습니다.');
      stockError.name = 'stockException';
      throw stockError;
    }

    const prices: { [key: string]: number } = {};
    stocks.forEach((stock: Stock) => {
      prices[stock.corpId] = stock.price;
    });

    const players: Player[] = await this.playerModel
      .find({ game: Types.ObjectId(gameId) })
      .exec();

    let individualSum = 0;

    const individualScores: PlayerScore[] = players
      .filter((player: Player) => player.role === 'individual')
      .map((player: Player) => {
        const stockCash: number = player.assets.reduce(
          (acc: number, cur: Asset) =>
            acc + prices[cur.corpId] * cur.totalQuantity,
          0,
        );

        const initialCash = this.getCash(player.role).totalCash;
        const score = player.cash.totalCash + stockCash - initialCash;
        individualSum += score;

        return {
          playerId: player._id,
          name: player.name,
          score,
        };
      });

    const institutionalScores: PlayerScore[] = players
      .filter((player: Player) => player.role === 'institutional')
      .map((player: Player) => {
        const stockCash: number = player.assets.reduce(
          (acc: number, cur: Asset) =>
            acc + prices[cur.corpId] * cur.totalQuantity,
          0,
        );

        const initialCash = this.getCash(player.role).totalCash;
        const score =
          Math.round((player.cash.totalCash + stockCash - initialCash) / 100) -
          individualSum;

        return {
          playerId: player._id,
          name: player.name,
          score,
        };
      });

    const partyScores: PlayerScore[] = players
      .filter((player: Player) => player.role === 'party')
      .map((player: Player) => {
        const stockCash: number = player.assets.reduce(
          (acc: number, cur: Asset) =>
            acc + prices[cur.corpId] * cur.totalQuantity,
          0,
        );

        const targetCorp: Corp = game.corps.find((corp: Corp) => corp.target);

        const initialCash = this.getCash(player.role).totalCash;
        const score = Math.round(
          (player.cash.totalCash + stockCash - initialCash) / 2 +
            // 점수 수정 필요
            Math.floor(
              100_000 /
                Math.abs(prices[targetCorp.corpId] - targetCorp.target + 1),
            ),
        );

        return {
          playerId: player._id,
          name: player.name,
          score,
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
