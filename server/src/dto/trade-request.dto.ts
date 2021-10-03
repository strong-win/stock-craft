import { IsNotEmpty } from 'class-validator';

export class TradeRequestDto {
  @IsNotEmpty()
  room: string;

  @IsNotEmpty()
  week: number;

  @IsNotEmpty()
  day: number;

  @IsNotEmpty()
  tick: number;

  @IsNotEmpty()
  ticker: string;

  @IsNotEmpty()
  corpName: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  quantity: number;

  @IsNotEmpty()
  deal: string;
}
