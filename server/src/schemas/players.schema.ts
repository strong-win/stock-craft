import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PlayerDocument = Player & Document;

export type assetType = {
  ticker: string;
  corpName: string;
  quantity: number;
};

@Schema()
export class Player {
  @Prop({ unique: true })
  clientId: string;

  @Prop()
  name: string;

  @Prop()
  room: string;

  @Prop()
  cash: number;

  @Prop()
  assets: assetType[];
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
