import { IsNotEmpty } from 'class-validator';
import { Asset } from '../schemas/players.schema';

type Trade = {
  _id: string;
  corpId: string;
  price: number;
  quantity: number;
  deal: string;
  status: 'pending' | 'disposed' | 'cancel';
};

export class TradeResponseDto {
  @IsNotEmpty()
  cash: number;

  @IsNotEmpty()
  assets: Asset[];

  @IsNotEmpty()
  action: 'request' | 'refresh' | 'cancel';

  @IsNotEmpty()
  trades: Trade[];
}
