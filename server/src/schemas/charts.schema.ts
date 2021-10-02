import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ChartDocument = Chart & Document;

@Schema()
export class Chart {
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
  corp: string;

  @Prop()
  price: number;
}

export const ChartSchema = SchemaFactory.createForClass(Chart);
