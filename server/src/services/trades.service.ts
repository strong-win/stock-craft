import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TradeCancelDto } from 'src/dto/trade-cancel.dto';
import { TradeRefreshDto } from 'src/dto/trade-refresh.dto';
import { TradeRequestDto } from 'src/dto/trade-request.dto';
import { TradeResponseDto } from 'src/dto/trade-response.dto';
import { Player, PlayerDocument } from 'src/schemas/players.schema';
import { Stock, StockDocument } from 'src/schemas/stocks.schema';
import { Trade, TradeDocument } from 'src/schemas/trades.schema';
import { GamesService, TimeState } from './games.service';

@Injectable()
export class TradesService {
  constructor(
    @InjectModel(Trade.name) private tradeModel: Model<TradeDocument>,
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    private gamesService: GamesService,
  ) {}

  async handleTrade(
    tradeRequestDto: TradeRequestDto,
  ): Promise<TradeResponseDto> {
    const { playerId, gameId, week, day, tick, corpId, price, quantity, deal } =
      tradeRequestDto;

    const time: TimeState = this.gamesService.getTime(gameId);

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
      gameId,
      week,
      day,
      tick,
      corpId,
    });

    // find player asset
    const player = await this.playerModel.findOne({ _id: playerId });

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
      week,
      day,
      tick,
      playerId,
      corpId,
      price,
      quantity,
      deal,
      status: isDirect ? 'disposed' : 'pending',
    });

    // modify asset with new stocks
    await this.playerModel.updateOne(
      { _id: playerId },
      { cash: player.cash, assets: player.assets },
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

  // trade refresh
  async handleRefresh(
    tradeRefreshDto: TradeRefreshDto,
  ): Promise<TradeResponseDto> {
    const { gameId, playerId, week, day, tick } = tradeRefreshDto;
    const player = await this.playerModel.findOne({ _id: playerId });
    const trades = await this.tradeModel
      .find({ playerId, status: 'pending' })
      .exec();

    const tradesDisposed = [];
    for (const trade of trades) {
      const { corpId } = trade;

      const stock = await this.stockModel.findOne({
        gameId,
        week,
        day,
        tick,
        corpId,
      });

      if (trade.deal === 'buy') {
        if (trade.price >= stock.price) {
          for (const asset of player.assets) {
            if (asset.corpId === corpId) {
              asset.quantity += trade.quantity;
            }
          }
          await this.tradeModel.updateOne(
            { _id: trade._id },
            { $set: { status: 'disposed' } },
          );
          trade.status = 'disposed';
          tradesDisposed.push(trade);
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
          tradesDisposed.push(trade);
        }
      }

      await this.playerModel.updateOne(
        { _id: playerId },
        { cash: player.cash, assets: player.assets },
      );
    }

    return {
      cash: player.cash,
      assets: player.assets,
      action: 'refresh',
      trades: tradesDisposed.map((trade) => ({
        _id: trade._id,
        corpId: trade.corpId,
        price: trade.price,
        quantity: trade.quantity,
        deal: trade.deal,
        status: trade.status,
      })),
    };
  }

  // trade cancel
  async handleTradeCancel(
    tradeCancelDto: TradeCancelDto,
  ): Promise<TradeResponseDto> {
    const { playerId, _id, corpId } = tradeCancelDto;
    const player = await this.playerModel.findOne({ _id: playerId });
    const trade = await this.tradeModel.findOne({
      _id,
      corpId,
      playerId,
      status: 'pending',
    });

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
      { _id: playerId },
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
