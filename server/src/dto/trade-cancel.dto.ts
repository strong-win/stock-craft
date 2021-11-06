import { IsNotEmpty } from 'class-validator';

export class TradeCancelDto {
  @IsNotEmpty()
  gameId: string;

  @IsNotEmpty()
  playerId: string;

  @IsNotEmpty()
  week: number;

  @IsNotEmpty()
  day: number;

  @IsNotEmpty()
  tick: number;

  @IsNotEmpty()
  corpId: string;

  @IsNotEmpty()
  _id: string;
}
