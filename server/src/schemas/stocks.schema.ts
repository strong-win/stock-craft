import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type StockDocument = Stock & Document;

@Schema()
export class Stock {
  @Prop()
  gameId: string;

  @Prop()
  week: number;

  @Prop()
  day: number;

  @Prop()
  tick: number;

  @Prop()
  corpId: string;

  @Prop()
  corpName: string;

  @Prop()
  price: number;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
