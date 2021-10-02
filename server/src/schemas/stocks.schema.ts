import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type StockDocument = Stock & Document;

@Schema()
export class Stock {
  @Prop()
  room: string;

  @Prop()
  week: number;

  @Prop()
  day: number;

  @Prop()
  tick: number;

  @Prop()
  ticker: string;

  @Prop()
  corpName: string;

  @Prop()
  price: number;
}

export const StocksSchema = SchemaFactory.createForClass(Stock);
