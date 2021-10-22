import { IsNotEmpty } from 'class-validator';

export class TradeCancelDto {
  @IsNotEmpty()
  playerId: string;

  @IsNotEmpty()
  _id: string;

  @IsNotEmpty()
  corpId: string;
}
