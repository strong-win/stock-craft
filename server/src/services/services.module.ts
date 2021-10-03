import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Stock, StocksSchema } from '../schemas/stocks.schema';
import { Player, PlayerSchema } from '../schemas/players.schema';
import { Trade, TradesSchema } from '../schemas/trades.schema';

import { PlayersService } from './players.service';
import { StocksService } from './stocks.service';
import { TradesService } from './trades.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    MongooseModule.forFeature([{ name: Stock.name, schema: StocksSchema }]),
    MongooseModule.forFeature([{ name: Trade.name, schema: TradesSchema }]),
  ],
  providers: [PlayersService, StocksService, TradesService],
  exports: [PlayersService, StocksService, TradesService],
})
export class ServicesModule {}
