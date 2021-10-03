import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date } from 'mongoose';

export type TradeDocument = Trade & Document;

@Schema()
export class Trade {
  @Prop({ unique: true })
  clientId: string;

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

  @Prop()
  quantity: number;

  @Prop()
  deal: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const TradesSchema = SchemaFactory.createForClass(Trade);
