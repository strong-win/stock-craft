import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GameDocument = Game & Document;

export type Corp = { corpId: string; corpName: string };

@Schema()
export class Game {
  @Prop()
  room: string;

  @Prop()
  corps: Corp[];
}

export const GameSchema = SchemaFactory.createForClass(Game);
