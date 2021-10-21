import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TradeCancelDto } from 'src/dto/trade-cancel.dto';
import { TradeRequestDto } from 'src/dto/trade-request.dto';
import { TradeResponseDto } from 'src/dto/trade-response.dto';
import { Player, PlayerDocument } from 'src/schemas/player.schema';
import { Stock, StockDocument } from 'src/schemas/stock.schema';
import { Trade, TradeDocument } from 'src/schemas/trade.schema';
import { GameService, TimeState } from './game.service';

@Injectable()
export class TradeService {
  constructor(
    @InjectModel(Trade.name) private tradeModel: Model<TradeDocument>,
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    private gameService: GameService,
  ) {}

  async handleTrade(
    tradeRequestDto: TradeRequestDto,
  ): Promise<TradeResponseDto> {
    const { playerId, gameId, week, day, tick, corpId, price, quantity, deal } =
      tradeRequestDto;

    const time: TimeState = this.gameService.getTime(gameId);

    if (
      time.week !== week ||
      time.day !== day ||
      time.tick !== tick ||
      time.tick > 3 ||
      day < 1
    ) {
      const timeError = new Error(
        '거래 시간이 불일치하거나 거래 불가능 시간입니다.',
      );
      timeError.name = 'TimeException';
      throw timeError;
    }

    // find stock price
    const stock = await this.stockModel.findOne({
      game: Types.ObjectId(gameId),
      week,
      day,
      tick,
      corpId,
    });

    // find player asset
    const player = await this.playerModel.findOne({
      _id: Types.ObjectId(playerId),
    });

    let isDirect: boolean;
    if (deal === 'buy') {
      // check if player can trade
      if (player.cash < price * quantity) {
        const tradeError = new Error('유저 계좌 잔액이 부족합니다');
        tradeError.name = 'TradeException';
        throw tradeError;
      }

      // check if player can directly trade
      isDirect = stock.price <= price ? true : false;

      for (const asset of player.assets) {
        if (asset.corpId === corpId) {
          asset.quantity = isDirect
            ? asset.quantity + quantity
            : asset.quantity;
        }
      }
      // caclulate cash and asset with deal
      player.cash -= price * quantity;
    }
    if (deal == 'sell') {
      // check if player can directly trade
      isDirect = stock.price >= price ? true : false;

      for (const asset of player.assets) {
        if (asset.corpId === corpId) {
          // check if player can trade
          if (asset.quantity < quantity) {
            const tradeError = new Error('유저 계좌 잔액이 부족합니다');
            tradeError.name = 'TradeException';
            throw tradeError;
          }
          asset.quantity = asset.quantity - quantity;
        }
      }
      // if corp is included in assets
      isDirect ? (player.cash += price * quantity) : null;
    }

    // add to trade collection if player cannot directly trade
    const trade = await this.tradeModel.create({
      player,
      week,
      day,
      tick,
      corpId,
      price,
      quantity,
      deal,
      status: isDirect ? 'disposed' : 'pending',
    });

    // modify asset with new stocks
    await this.playerModel.updateOne(
      { _id: Types.ObjectId(playerId) },
      {
        cash: player.cash,
        assets: player.assets,
        trades: [...player.trades, trade],
      },
    );

    return {
      cash: player.cash,
      assets: player.assets,
      action: 'request',
      trades: [
        {
          _id: trade._id,
          corpId: trade.corpId,
          price: trade.price,
          quantity: trade.quantity,
          deal: trade.deal,
          status: trade.status,
        },
      ],
    };
  }

  async handleRefresh(
    gameId: string,
    week: number,
    day: number,
    tick: number,
  ): Promise<TradeResponseDto[]> {
    const players = await this.playerModel
      .find({ game: Types.ObjectId(gameId) })
      .populate({ path: 'trades', match: { status: 'pending' } })
      .exec();

    const stocks = await this.stockModel
      .find({
        game: Types.ObjectId(gameId),
        week,
        day,
        tick,
      })
      .exec();

    const playersResponse: TradeResponseDto[] = [];
    const tradesResponse: Trade[] = [];

    for (const player of players) {
      for (const trade of player.trades) {
        const isTrade = (trade: Types.ObjectId | Trade): trade is Trade => {
          return (<Trade>trade)._id !== undefined;
        };

        if (!isTrade(trade)) {
          const typeGuardError = Error('타입이 일치하지 않습니다.');
          typeGuardError.name = 'TypeGuardError';
          throw typeGuardError;
        }

        const stock = stocks.find((stock) => stock.corpId === trade.corpId);

        if (trade.deal === 'buy') {
          if (trade.price >= stock.price) {
            for (const asset of player.assets) {
              if (asset.corpId === trade.corpId) {
                asset.quantity += trade.quantity;
              }
            }
            await this.tradeModel.updateOne(
              { _id: trade._id },
              { $set: { status: 'disposed' } },
            );
            trade.status = 'disposed';
            tradesResponse.push(trade);
          }
        }

        if (trade.deal === 'sell') {
          if (trade.price <= stock.price) {
            player.cash += trade.price * trade.quantity;

            await this.tradeModel.updateOne(
              { _id: trade._id },
              { $set: { status: 'disposed' } },
            );
            trade.status = 'disposed';
            tradesResponse.push(trade);
          }
        }
      }

      await this.playerModel.updateOne(
        { _id: player._id },
        { cash: player.cash, assets: player.assets },
      );

      playersResponse.push({
        cash: player.cash,
        assets: player.assets,
        clientId: player.clientId,
        action: 'refresh',
        trades: tradesResponse.map((trade: Trade) => ({
          _id: trade._id,
          corpId: trade.corpId,
          price: trade.price,
          quantity: trade.quantity,
          deal: trade.deal,
          status: trade.status,
        })),
      });
    }

    return playersResponse;
  }

  // trade cancel
  async handleTradeCancel(
    tradeCancelDto: TradeCancelDto,
  ): Promise<TradeResponseDto> {
    const { playerId, _id, corpId } = tradeCancelDto;
    const player = await this.playerModel.findOne({
      _id: Types.ObjectId(playerId),
    });
    const trade = await this.tradeModel.findOne({ _id: Types.ObjectId(_id) });

    if (trade.deal === 'buy') {
      player.cash += trade.price * trade.quantity;
    }
    if (trade.deal === 'sell') {
      for (const asset of player.assets) {
        if (asset.corpId == corpId) {
          asset.quantity = asset.quantity + trade.quantity;
        }
      }
    }
    trade.status = 'cancel';
    trade.save();

    await this.playerModel.updateOne(
      { _id: Types.ObjectId(playerId) },
      { cash: player.cash, assets: player.assets },
    );

    return {
      cash: player.cash,
      assets: player.assets,
      action: 'cancel',
      trades: [
        {
          _id: trade._id,
          corpId: trade.corpId,
          price: trade.price,
          quantity: trade.quantity,
          deal: trade.deal,
          status: trade.status,
        },
      ],
    };
  }
}