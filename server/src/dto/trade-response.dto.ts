import { IsNotEmpty } from 'class-validator';
import { assetType } from '../schemas/players.schema';

export class TradeResponseDto {
  @IsNotEmpty()
  cash: number;

  @IsNotEmpty()
  assets: assetType[];

  @IsNotEmpty()
  corpId: string;
}
