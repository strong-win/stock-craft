import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Date } from 'mongoose';
import { Player } from './player.schema';

export type TradeDocument = Trade & Document;

@Schema()
export class Trade {
  _id: Types.ObjectId;

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

  @Prop()
  quantity: number;

  @Prop()
  deal: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop()
  status: 'pending' | 'cancel' | 'disposed';

  @Prop({ type: Types.ObjectId, ref: 'Player' })
  player: Player;
}

export const TradeSchema = SchemaFactory.createForClass(Trade);
