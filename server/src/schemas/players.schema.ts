import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PlayerDocument = Player & Document;

export type Asset = {
  corpId: string;
  quantity: number;
};

export type PlayerStatus =
  | 'connected'
  | 'ready'
  | 'play'
  | 'finish'
  | 'disconnected';

export type PlayerInfo = {
  name: string;
  status: PlayerStatus;
};

@Schema()
export class Player {
  @Prop()
  room: string;

  @Prop()
  clientId: string;

  @Prop()
  name: string;

  @Prop()
  status: PlayerStatus;

  @Prop()
  gameId?: string;

  @Prop()
  cash?: number;

  @Prop()
  assets?: Asset[];
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
