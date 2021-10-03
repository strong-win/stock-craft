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
    const { room, week, day, tick, ticker, corpName, price, quantity, deal } =
      tradeRequestDto;

    // find stock price
    const stock = await this.stockModel.findOne({
      room,
      week,
      day,
      tick,
      ticker,
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

      // flag for player assets having ticker object
      let isIncluded = false;
      for (let asset of player.assets) {
        if (asset.ticker === ticker) {
          // if player can directly trade
          if (isDirect) {
            asset = { ...asset, quantity: (asset.quantity += quantity) };
            isIncluded = true;
          }
        }
      }
      // if player can directly trade but not included
      if (isDirect && !isIncluded) {
        player.assets.push({ ticker, corpName, quantity });
      }

      // caclulate cash and asset with deal
      player.cash -= price * quantity;
    }
    if (deal == 'sell') {
      // check if player can directly trade
      isDirect = stock.price >= price ? true : false;

      let isIncluded = false;
      for (let asset of player.assets) {
        if (asset.ticker === ticker) {
          // check if player can trade
          if (asset.quantity < quantity) {
            const error = new Error('유저 자산 수량이 부족합니다');
            error.name = 'TradeException';
            throw error;
          }
          // update quantity if player can directly trade
          asset = { ...asset, quantity: (asset.quantity -= quantity) };
          isIncluded = true;
        }
      }
      // if player cannot trade because of asset not included
      if (!isIncluded) {
        const error = new Error('유저 자산 수량이 부족합니다');
        error.name = 'TradeException';
        throw error;
      }

      if (isDirect && isIncluded) {
        // caclulate cash and asset with deal
        player.cash += price * quantity;
      }
    }
    // modify asset with new stocks
    await this.playerModel.updateOne(
      { clientId },
      { cash: player.cash, assets: player.assets },
    );
    // add to trade collection if player cannot directly trade
    if (!isDirect) {
      const trade = { clientId, ticker, corpName, price, quantity, deal };
      this.tradeModel.create(trade);
    }

    return {
      player,
      trade: { ticker, corpName, price, quantity, deal, isLock: !isDirect },
    };
  }

  // To do
  // trade refresh
  // trade cancel
}
