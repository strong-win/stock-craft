import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, Types } from 'mongoose';
import { Game } from './game.schema';
import { Trade } from './trade.schema';

export type PlayerDocument = Player & Document;

export type Role = 'individual' | 'institutional' | 'party';

export type Asset = {
  corpId: string;
  totalQuantity: number;
  availableQuantity: number;
  purchaseAmount: number;
};

export interface Cash {
  totalCash: number;
  availableCash: number;
}

export type PlayerOption = {
  chatoff?: boolean;
  tradeoff?: boolean;
};

export type PlayerSkill = {
  leverage?: boolean;
  cloaking?: string;
};

export type PlayerStatus =
  | 'connected'
  | 'ready'
  | 'play'
  | 'finish'
  | 'disconnected';

@Schema()
export class Player {
  _id: Types.ObjectId;

  @Prop()
  room: string;

  @Prop()
  clientId: string;

  @Prop()
  name: string;

  @Prop()
  status: PlayerStatus;

  @Prop()
  isHost: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'Game' })
  game: Types.ObjectId | Game;

  @Prop()
  role?: Role;

  @Prop({ type: { totalCash: Number, availableCash: Number } })
  cash?: Cash;

  @Prop()
  assets?: Asset[];

  @Prop({ type: [Types.ObjectId], ref: 'Trade' })
  trades?: (Types.ObjectId | Trade)[];

  @Prop({
    type: {
      chatoff: Boolean,
      tradeoff: Boolean,
    },
  })
  options?: PlayerOption;

  @Prop({
    type: {
      leverage: Boolean,
    },
  })
  skills?: PlayerSkill;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
