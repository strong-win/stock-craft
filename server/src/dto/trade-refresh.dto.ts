import { IsNotEmpty } from 'class-validator';

export class TradeRefreshDto {
  @IsNotEmpty()
  room: string;

  @IsNotEmpty()
  week: number;

  @IsNotEmpty()
  day: number;

  @IsNotEmpty()
  tick: number;
}
