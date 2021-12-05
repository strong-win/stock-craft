import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Player } from './player.schema';

export type GameDocument = Game & Document;

export type Corp = {
  corpId: string;
  corpName: string;
  totalChart: number[];
  target?: boolean;
};

@Schema()
export class Game {
  _id: Types.ObjectId;

  @Prop()
  room: string;

  @Prop()
  corps: Corp[];

  @Prop({ type: [Types.ObjectId], ref: 'Player' })
  players: Player[];
}

export const GameSchema = SchemaFactory.createForClass(Game);
