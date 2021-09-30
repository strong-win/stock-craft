import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type StockDocument = Stock & Document;

interface DayStock {
  race: string;
  tick: number;
  price: number;
}

@Schema()
export class Stock {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Player' })
  roomId: string;

  @Prop()
  week: number;

  @Prop()
  days: DayStock[];
}

export const StockSchema = SchemaFactory.createForClass(Stock);
