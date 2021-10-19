import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GameDocument = Game & Document;

@Schema()
export class Game {
  @Prop()
  room: string;

  @Prop()
  corps: { corpId: string; corpName: string }[];

  // clientId Array waits on game start request
  @Prop()
  waits: string[];
}

export const GamesSchema = SchemaFactory.createForClass(Game);
