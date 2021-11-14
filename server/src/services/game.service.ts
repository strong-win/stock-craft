import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ChartRequestDto, CorpEvents } from 'src/dto/chart-request.dto';
import { Game, GameDocument } from 'src/schemas/game.schema';
import { Trade, TradeDocument } from 'src/schemas/trade.schema';
import { TimeState } from 'src/states/game.state';
import { CorpStateProvider, CorpState } from 'src/states/corp.state';
import { Player, PlayerDocument } from 'src/schemas/player.schema';

export type PlayerScore = {
  clientId: string;
  score: number;
};

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    @InjectModel(Trade.name) private tradeModel: Model<TradeDocument>,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,

    private corpState: CorpStateProvider,
  ) {}
  async composeChartRequest(
    gameId: string,
    prevTime: TimeState,
    nextTime: TimeState,
  ): Promise<ChartRequestDto> {
    const game: Game = await this.gameModel.findOne({
      _id: Types.ObjectId(gameId),
    });

    const corpStates: CorpState[] = this.corpState.findByGameId(
      gameId,
      prevTime.week,
      prevTime.day,
    );

    const trades: Trade[] = await this.tradeModel
      .find({
        game: Types.ObjectId(gameId),
        week: prevTime.week,
        day: prevTime.day,
        status: { $in: ['pending', 'disposed'] },
      })
      .exec();

    const corps: CorpEvents = {};

    game.corps.forEach(({ corpId }) => {
      corps[corpId] = {
        increment:
          corpStates.find((corpState) => corpId == corpState.corpId)
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
    const initialCash = 10_000_000;

    const players: Player[] = await this.playerModel
      .find({ game: Types.ObjectId(gameId) })
      .exec();

    const playerScores: PlayerScore[] = players.map((player) => ({
      clientId: player.clientId,
      score: player.cash.totalCash - initialCash,
    }));

    return playerScores;
  }
}
