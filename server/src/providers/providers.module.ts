import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Stock, StockSchema } from 'src/schemas/stock.schema';
import { StatesModule } from 'src/states/states.modules';
import { EffectProvider } from './effect.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Stock.name, schema: StockSchema }]),
    StatesModule,
  ],
  providers: [EffectProvider],
  exports: [EffectProvider],
})
export class ProvidersModule {}
