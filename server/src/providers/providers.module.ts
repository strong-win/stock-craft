import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Player, PlayerSchema } from 'src/schemas/player.schema';
import { Stock, StockSchema } from 'src/schemas/stock.schema';
import { StatesModule } from 'src/states/states.modules';
import { EffectProvider } from './effect.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    MongooseModule.forFeature([{ name: Stock.name, schema: StockSchema }]),
    StatesModule,
  ],
  providers: [EffectProvider],
  exports: [EffectProvider],
})
export class ProvidersModule {}
