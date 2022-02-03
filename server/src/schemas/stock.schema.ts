import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Game } from './game.schema';

export type StockDocument = Stock & Document;

@Schema()
export class Stock {
  @Prop()
  week: number;

  @Prop()
  day: number;

  @Prop()
  tick: number;

  @Prop()
  corpId: string;

  @Prop()
  price: number;

  @Prop({ type: Types.ObjectId, ref: 'Game' })
  game: Types.ObjectId | Game;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
