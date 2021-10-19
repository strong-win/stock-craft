import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Stock, StocksSchema } from '../schemas/stocks.schema';
import { Player, PlayerSchema } from '../schemas/players.schema';
import { Trade, TradesSchema } from '../schemas/trades.schema';
import { Game, GamesSchema } from 'src/schemas/games.schema';
import { Item, ItemsSchema } from 'src/schemas/items.schema';

import { PlayersService } from './players.service';
import { StocksService } from './stocks.service';
import { TradesService } from './trades.service';
import { GamesService } from './games.service';
import { ItemsService } from './items.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    MongooseModule.forFeature([{ name: Stock.name, schema: StocksSchema }]),
    MongooseModule.forFeature([{ name: Trade.name, schema: TradesSchema }]),
    MongooseModule.forFeature([{ name: Game.name, schema: GamesSchema }]),
    MongooseModule.forFeature([{ name: Item.name, schema: ItemsSchema }]),
  ],
  providers: [
    PlayersService,
    StocksService,
    TradesService,
    GamesService,
    ItemsService,
  ],
  exports: [
    PlayersService,
    StocksService,
    TradesService,
    GamesService,
    ItemsService,
  ],
})
export class ServicesModule {}
