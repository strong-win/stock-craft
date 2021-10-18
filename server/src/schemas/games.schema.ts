import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GameDocument = Game & Document;

export type Corp = { corpId: string; corpName: string };

@Schema()
export class Game {
  @Prop()
  room: string;

  @Prop()
  corps: Corp[];

  @Prop()
  status: 'play' | 'finish';
}

export const GameSchema = SchemaFactory.createForClass(Game);
