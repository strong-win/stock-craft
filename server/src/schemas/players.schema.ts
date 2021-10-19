import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PlayerDocument = Player & Document;

export type assetType = {
  corpId: string;
  quantity: number;
};

@Schema()
export class Player {
  @Prop()
  room: string;

  @Prop({ unique: true })
  clientId: string;

  @Prop()
  name: string;

  @Prop()
  cash: number;

  @Prop()
  assets: assetType[];
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
