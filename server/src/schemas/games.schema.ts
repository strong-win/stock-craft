import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GameDocument = Game & Document;

@Schema()
export class Game {
  @Prop()
  room: string;

  @Prop()
  corps: { corpId: string; corpName: string }[];
}

export const GamesSchema = SchemaFactory.createForClass(Game);
