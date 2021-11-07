import { IsNotEmpty } from 'class-validator';
import { TimeState } from 'src/states/game.state.';

export type TradeVolume = {
  buyQuantity: number;
  sellQuantity: number;
};

export class ChartRequestDto {
  @IsNotEmpty()
  gameId: string;

  @IsNotEmpty()
  prevTime: TimeState;

  @IsNotEmpty()
  nextTime: TimeState;

  @IsNotEmpty()
  itemTypes: string[];

  @IsNotEmpty()
  tradeVolume: TradeVolume;
}
