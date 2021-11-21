import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { Stock, StockSchema } from 'src/schemas/stock.schema';
import { Player, PlayerSchema } from 'src/schemas/player.schema';
import { Trade, TradeSchema } from 'src/schemas/trade.schema';
import { Game, GameSchema } from 'src/schemas/game.schema';
import { Item, ItemSchema } from 'src/schemas/item.schema';
import { StatesModule } from 'src/states/states.modules';

import { PlayerService } from './player.service';
import { StockService } from './stock.service';
import { TradeService } from './trade.service';
import { ItemService } from './item.service';
import { JoinService } from './join.service';
import { GameService } from './game.service';
import { ProvidersModule } from 'src/providers/providers.module';
import { ApiModule } from 'src/api/api.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    MongooseModule.forFeature([{ name: Stock.name, schema: StockSchema }]),
    MongooseModule.forFeature([{ name: Trade.name, schema: TradeSchema }]),
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
    MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }]),
    StatesModule,
    ConfigModule,
    ProvidersModule,
    ApiModule,
  ],
  providers: [
    PlayerService,
    StockService,
    TradeService,
    ItemService,
    JoinService,
    GameService,
  ],
  exports: [
    PlayerService,
    StockService,
    TradeService,
    ItemService,
    JoinService,
    GameService,
  ],
})
export class ServicesModule {}
