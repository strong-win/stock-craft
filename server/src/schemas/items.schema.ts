import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ItemDocument = Item & Document;

@Schema()
export class Item {
  @Prop()
  gameId: string;

  @Prop()
  playerId: string;

  @Prop()
  week: number;

  @Prop()
  day: number;

  @Prop()
  item: string[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
