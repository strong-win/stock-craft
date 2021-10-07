import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TradeRequestDto } from 'src/dto/trade-request.dto';
import { TradeResponseDto } from 'src/dto/trade-response.dto';
import { Player, PlayerDocument } from 'src/schemas/players.schema';
import { Stock, StockDocument } from 'src/schemas/stocks.schema';
import { Trade, TradeDocument } from 'src/schemas/trades.schema';

@Injectable()
export class TradesService {
  constructor(
    @InjectModel(Trade.name) private tradeModel: Model<TradeDocument>,
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
  ) {}

  async handleTrade(
    clientId: string,
    tradeRequestDto: TradeRequestDto,
  ): Promise<TradeResponseDto> {
    const { room, week, day, tick, corpId, corpName, price, quantity, deal } =
      tradeRequestDto;

    // find stock price
    const stock = await this.stockModel.findOne({
      room,
      week,
      day,
      tick,
      corpId,
    });

    // find player asset
    const player = await this.playerModel.findOne({ clientId });

    let isDirect: boolean;
    if (deal === 'buy') {
      // check if player can trade
      if (player.cash < price * quantity) {
        const error = new Error('유저 계좌 잔액이 부족합니다');
        error.name = 'TradeException';
        throw error;
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
            const error = new Error('유저 자산 수량이 부족합니다');
            error.name = 'TradeException';
            throw error;
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
      clientId,
      corpId,
      corpName,
      price,
      quantity,
      deal,
      status: isDirect ? 'disposed' : 'pending',
    });

    // modify asset with new stocks
    await this.playerModel.updateOne(
      { clientId },
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
          corpName: trade.corpName,
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
    room: string,
    clientId: string,
    week: number,
    day: number,
    tick: number,
  ): Promise<TradeResponseDto> {
    const player = await this.playerModel.findOne({ clientId });
    const trades = await this.tradeModel
      .find({ clientId, status: 'pending' })
      .exec();

    const tradesDisposed = [];
    for (const trade of trades) {
      const { corpId } = trade;
      const stock = await this.stockModel.findOne({
        room,
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
        { clientId },
        { cash: player.cash, assets: player.assets },
      );
    }

    console.log(player);
    return {
      cash: player.cash,
      assets: player.assets,
      action: 'refresh',
      trades: tradesDisposed.map((trade) => ({
        _id: trade._id,
        corpId: trade.corpId,
        corpName: trade.corpName,
        price: trade.price,
        quantity: trade.quantity,
        deal: trade.deal,
        status: trade.status,
      })),
    };
  }

  // trade cancel
  async handleTradeCancel(
    clientId: string,
    _id: string,
    corpId: string,
  ): Promise<TradeResponseDto> {
    const player = await this.playerModel.findOne({ clientId });
    const trade = await this.tradeModel.findOne({
      _id,
      corpId,
      clientId,
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
      { clientId },
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
          corpName: trade.corpName,
          price: trade.price,
          quantity: trade.quantity,
          deal: trade.deal,
          status: trade.status,
        },
      ],
    };
  }
}
