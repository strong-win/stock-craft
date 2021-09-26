import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PlayerDocument = Player & Document;

@Schema()
export class Player {
  @Prop({ unique: true })
  clientId: string;

  @Prop()
  name: string;

  @Prop()
  room: string;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
