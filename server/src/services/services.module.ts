import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Stock, StockSchema } from '../schemas/stocks.schema';
import { Player, PlayerSchema } from '../schemas/players.schema';
import { Trade, TradeSchema } from '../schemas/trades.schema';
import { Game, GameSchema } from 'src/schemas/games.schema';
import { Item, ItemSchema } from 'src/schemas/items.schema';
import { ConfigModule } from '@nestjs/config';

import { PlayersService } from './players.service';
import { StocksService } from './stocks.service';
import { TradesService } from './trades.service';
import { ItemsService } from './items.service';
import { JoinService } from './join.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    MongooseModule.forFeature([{ name: Stock.name, schema: StockSchema }]),
    MongooseModule.forFeature([{ name: Trade.name, schema: TradeSchema }]),
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
    MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }]),
    ConfigModule,
  ],
  providers: [
    PlayersService,
    StocksService,
    TradesService,
    ItemsService,
    JoinService,
  ],
  exports: [
    PlayersService,
    StocksService,
    TradesService,
    ItemsService,
    JoinService,
  ],
})
export class ServicesModule {}
