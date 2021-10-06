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
  item: number;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
