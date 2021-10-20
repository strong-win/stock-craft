import { IsNotEmpty } from 'class-validator';

export class ItemRequestDto {
  @IsNotEmpty()
  gameId: string;

  @IsNotEmpty()
  playerId: string;

  @IsNotEmpty()
  week: number;

  @IsNotEmpty()
  day: number;

  @IsNotEmpty()
  item: string[];
}
