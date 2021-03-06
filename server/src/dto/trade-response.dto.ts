import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { Asset, Cash } from '../schemas/player.schema';

type Trade = {
  _id: Types.ObjectId;
  corpId: string;
  price: number;
  quantity: number;
  deal: string;
  status: 'pending' | 'disposed' | 'cancel';
};

export class TradeResponseDto {
  @IsNotEmpty()
  cash: Cash;

  @IsNotEmpty()
  assets: Asset[];

  clientId?: string;

  @IsNotEmpty()
  action: 'request' | 'refresh' | 'cancel';

  @IsNotEmpty()
  trades: Trade[];
}
