import { Player } from 'src/schemas/player.schema';
import { Game } from 'src/schemas/game.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type ItemDocument = Item & Document;

@Schema()
export class Item {
  _id: Types.ObjectId;

  @Prop()
  week: number;

  @Prop()
  day: number;

  @Prop()
  moment: 'now' | 'before-infer' | 'after-infer' | 'end';

  @Prop()
  type: string;

  @Prop()
  target: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'Game' })
  game: Types.ObjectId | Game;

  @Prop({ type: Types.ObjectId, ref: 'Player' })
  player: Types.ObjectId | Player;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
