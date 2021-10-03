import { IsNotEmpty } from 'class-validator';

export class TradeRefreshDto {
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  week: number;

  @IsNotEmpty()
  day: number;

  @IsNotEmpty()
  tick: number;
}
