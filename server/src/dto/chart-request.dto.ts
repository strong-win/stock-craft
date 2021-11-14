import { IsNotEmpty } from 'class-validator';
import { TimeState } from 'src/states/game.state';

export type CorpEvent = {
  increment: number;
  buyQuantity: number;
  sellQuantity: number;
};

export type CorpEvents = {
  [key: string]: CorpEvent;
};

export class ChartRequestDto {
  @IsNotEmpty()
  gameId: string;

  @IsNotEmpty()
  prevTime: TimeState;

  @IsNotEmpty()
  nextTime: TimeState;

  @IsNotEmpty()
  corps: CorpEvents;
}
