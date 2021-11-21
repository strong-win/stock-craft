import { IsNotEmpty } from 'class-validator';

export class StartResponseDto {
  @IsNotEmpty()
  corpId: string;

  @IsNotEmpty()
  corpName: string;

  @IsNotEmpty()
  totalChart: number[];
}
