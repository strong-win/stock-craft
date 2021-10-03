import { IsNotEmpty } from 'class-validator';

export class ChartRequestDto {
  @IsNotEmpty()
  room: string;

  @IsNotEmpty()
  week: number;

  @IsNotEmpty()
  day: number;
}
