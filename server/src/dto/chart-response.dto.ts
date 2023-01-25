import { IsNotEmpty } from 'class-validator';

export type CorpResult = {
  info: number;
};

export type CorpResults = {
  [key: string]: CorpResult;
};

export class ChartResponseDto {
  @IsNotEmpty()
  gameId: string;

  @IsNotEmpty()
  corps: CorpResults;
}
