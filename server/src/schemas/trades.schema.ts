import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TradeDocument = Trade & Document;

@Schema()
export class Trade {
  @Prop({ unique: true })
  clientId: string;

  @Prop()
  corp: string;

  @Prop()
  price: number;

  @Prop()
  quantity: number;

  @Prop()
  deal: string;
}

export const TradeSchema = SchemaFactory.createForClass(Trade);
