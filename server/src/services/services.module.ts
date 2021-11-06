import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Stock, StockSchema } from '../schemas/stock.schema';
import { Player, PlayerSchema } from '../schemas/player.schema';
import { Trade, TradeSchema } from '../schemas/trade.schema';
import { Game, GameSchema } from 'src/schemas/game.schema';
import { Item, ItemSchema } from 'src/schemas/item.schema';
import { ConfigModule } from '@nestjs/config';

import { PlayerService } from './player.service';
import { StockService } from './stock.service';
import { TradeService } from './trade.service';
import { ItemService } from './item.service';
import { JoinService } from './join.service';
import { GameService } from './game.service';
import { EffectService } from './effect.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    MongooseModule.forFeature([{ name: Stock.name, schema: StockSchema }]),
    MongooseModule.forFeature([{ name: Trade.name, schema: TradeSchema }]),
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
    MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }]),
    RepositoriesModule,
    ConfigModule,
  ],
  providers: [
    PlayerService,
    StockService,
    TradeService,
    ItemService,
    JoinService,
    GameService,
    EffectService,
  ],
  exports: [
    PlayerService,
    StockService,
    TradeService,
    ItemService,
    JoinService,
    GameService,
    EffectService,
  ],
})
export class ServicesModule {}
