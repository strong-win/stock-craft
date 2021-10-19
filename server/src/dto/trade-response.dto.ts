import { IsNotEmpty } from 'class-validator';
import { assetType } from '../schemas/players.schema';

type tradeType = {
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
  assets: assetType[];

  @IsNotEmpty()
  action: 'request' | 'refresh' | 'cancel';

  @IsNotEmpty()
  trades: tradeType[];
}
