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
  moment: 'now' | 'before-infer' | 'after-infer' | 'end';

  @IsNotEmpty()
  category: 'chat' | 'trade' | 'chart' | 'cash' | 'asset' | 'stock';

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  target: string;
}
