import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Stock, StocksSchema } from '../schemas/stocks.schema';
import { Player, PlayerSchema } from '../schemas/players.schema';

import { PlayersService } from './players.service';
import { StocksService } from './stocks.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    MongooseModule.forFeature([{ name: Stock.name, schema: StocksSchema }]),
  ],
  providers: [PlayersService, StocksService],
  exports: [PlayersService, StocksService],
})
export class ServicesModule {}
