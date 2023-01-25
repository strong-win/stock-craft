import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TradeCancelDto } from 'src/dto/trade-cancel.dto';
import { TradeRequestDto } from 'src/dto/trade-request.dto';
import { TradeResponseDto } from 'src/dto/trade-response.dto';
import { Player, PlayerDocument } from 'src/schemas/player.schema';
import { Stock, StockDocument } from 'src/schemas/stock.schema';
import { Trade, TradeDocument } from 'src/schemas/trade.schema';
import { GameStateProvider, TimeState } from 'src/states/game.state';
import { isTrade } from 'src/utils/typeGuard';

@Injectable()
export class TradeService {
  constructor(
    @InjectModel(Trade.name) private tradeModel: Model<TradeDocument>,
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
    private gameState: GameStateProvider,
  ) {}

  async handleTrade(
    tradeRequestDto: TradeRequestDto,
  ): Promise<TradeResponseDto> {
    const { playerId, gameId, week, day, tick, corpId, price, quantity, deal } =
      tradeRequestDto;

    const time: TimeState = this.gameState.getTime(gameId);

    if (
      time.week !== week ||
      time.day !== day ||
      time.tick !== tick ||
      time.tick < 1 ||
      time.tick > 3 ||
      day < 1
    )
      throw Error('거래 시간이 불일치하거나 거래 불가능 시간입니다.');

    // find stock price
    const stock = await this.stockModel.findOne({
      game: Types.ObjectId(gameId),
      week,
      day,
      tick,
      corpId,
    });

    if (!stock) throw Error('주가 정보를 불러올 수 없습니다.');

    // find player asset
    const player = await this.playerModel.findOne({
      _id: Types.ObjectId(playerId),
    });

    if (!player) throw Error('플레이어 정보를 불러올 수 없습니다.');

    let isDirect: boolean;
    let isLeverage = false;
    let bonus: number;

    if (deal === 'buy') {
      // check if player can trade
      if (player.cash.availableCash < price * quantity)
        throw Error('거래 가능 잔액이 부족합니다.');

      // check if player can directly trade
      isDirect = stock.price <= price ? true : false;

      for (const asset of player.assets) {
        if (asset.corpId === corpId) {
          if (isDirect) {
            asset.availableQuantity += quantity;
            asset.totalQuantity += quantity;
            asset.purchaseAmount += price * quantity;
          }
        }
      }
      // caclulate cash and asset with deal
      player.cash.availableCash -= price * quantity;
      if (isDirect) {
        player.cash.totalCash -= price * quantity;
      }
    }
    if (deal === 'sell') {
      // check if player can directly trade
      isDirect = stock.price >= price ? true : false;
      if (isDirect && player.skills.leverage) isLeverage = true;

      for (const asset of player.assets) {
        if (asset.corpId === corpId) {
          // check if player can trade
          if (asset.availableQuantity < quantity)
            throw Error('거래 가능 수량이 부족합니다.');

          if (isLeverage)
            bonus =
              (price - Math.floor(asset.purchaseAmount / asset.totalQuantity)) *
              2;

          asset.availableQuantity -= quantity;
          if (isDirect) {
            asset.purchaseAmount -=
              (asset.purchaseAmount / asset.totalQuantity) * quantity;
            if (asset.purchaseAmount < 1e-6) asset.purchaseAmount = 0;
            asset.totalQuantity -= quantity;
          }
        }
      }
      // if corp is included in assets
      if (isDirect) {
        const amount = (price + (isLeverage ? bonus : 0)) * quantity;
        player.cash.totalCash += amount;
        player.cash.availableCash += amount;
      }
    }

    // add to trade collection if player cannot directly trade
    const trade = await this.tradeModel.create({
      game: Types.ObjectId(gameId),
      player,
      week,
      day,
      tick,
      corpId,
      price: price + (isLeverage ? bonus : 0),
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

    if (!players) throw Error('플레이어 정보를 불러올 수 없습니다.');

    if (!stocks) throw Error('주가 정보를 불러올 수 없습니다.');

    const playersResponse: TradeResponseDto[] = [];
    const tradesResponse: Trade[] = [];

    for (const player of players) {
      for (const trade of player.trades) {
        if (!isTrade(trade)) throw TypeError('타입이 일치하지 않습니다.');

        const stock = stocks.find((stock) => stock.corpId === trade.corpId);

        let isLeverage = false;

        if (trade.deal === 'buy') {
          if (trade.price >= stock.price) {
            // update player cash
            player.cash.totalCash -= trade.price * trade.quantity;

            // update player assets
            for (const asset of player.assets) {
              if (asset.corpId === trade.corpId) {
                asset.totalQuantity += trade.quantity;
                asset.availableQuantity += trade.quantity;
                asset.purchaseAmount += trade.price * trade.quantity;
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
          if (player.skills.leverage) isLeverage = true;

          if (trade.price <= stock.price) {
            // update player assets
            for (const asset of player.assets) {
              if (asset.corpId === trade.corpId) {
                if (isLeverage)
                  trade.price +=
                    (trade.price -
                      Math.floor(asset.purchaseAmount / asset.totalQuantity)) *
                    2;

                asset.purchaseAmount -=
                  (asset.purchaseAmount / asset.totalQuantity) * trade.quantity;
                if (asset.purchaseAmount < 1e-6) asset.purchaseAmount = 0;
                asset.totalQuantity -= trade.quantity;
              }
            }

            // update player cash
            const amount = trade.price * trade.quantity;
            player.cash.totalCash += amount;
            player.cash.availableCash += amount;

            await this.tradeModel.updateOne(
              { _id: trade._id },
              {
                $set: {
                  price: trade.price,
                  status: 'disposed',
                },
              },
            );
            trade.status = 'disposed';
            tradesResponse.push(trade);
          }
        }
      }

      await this.playerModel.updateOne(
        { _id: player._id },
        {
          cash: player.cash,
          assets: player.assets,
        },
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
    const { playerId, corpId, _id } = tradeCancelDto;

    const player = await this.playerModel.findOne({
      _id: Types.ObjectId(playerId),
    });

    if (!player) throw Error('플레이어 정보를 불러올 수 없습니다.');

    const trade = await this.tradeModel.findOne({ _id: Types.ObjectId(_id) });

    if (!trade) throw Error('거래 정보를 불러올 수 없습니다.');

    if (trade.deal === 'buy') {
      player.cash.availableCash += trade.price * trade.quantity;
    }
    if (trade.deal === 'sell') {
      for (const asset of player.assets) {
        if (asset.corpId == corpId) {
          asset.availableQuantity += trade.quantity;
        }
      }
    }
    trade.status = 'cancel';
    await trade.save();

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
