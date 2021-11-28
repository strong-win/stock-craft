import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ChartRequestDto, CorpEvents } from 'src/dto/chart-request.dto';
import { Game, GameDocument } from 'src/schemas/game.schema';
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
  ) {}
  async composeChartRequest(
    gameId: string,
    prevTime: TimeState,
    nextTime: TimeState,
  ): Promise<ChartRequestDto> {
    const game: Game = await this.gameModel.findOne({
      _id: Types.ObjectId(gameId),
    });

    const stockEffectState: StockEffectState[] =
      this.stockEffectState.findStockEffects(
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
    const NUM_STOCKS = 4; // actual NUM_STOCKS = 5

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

    const playerScores: PlayerScore[] = players.map((player) => {
      let purchaseAmount = 0;
      player.assets.forEach((asset: Asset) => {
        if (prices[asset.corpId])
          purchaseAmount += prices[asset.corpId] * asset.totalQuantity;
      });

      const initialCash = this.getCash(player.role).totalCash;
      const score = player.cash.totalCash + purchaseAmount - initialCash;

      return {
        playerId: player._id,
        name: player.name,
        score,
      };
    });

    return playerScores;
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
