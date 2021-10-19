import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ItemDocument = Item & Document;

@Schema()
export class Item {
  @Prop()
  clientId: string;

  @Prop()
  room: string;

  @Prop()
  week: number;

  @Prop()
  day: number;

  @Prop()
  item: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const ItemsSchema = SchemaFactory.createForClass(Item);
