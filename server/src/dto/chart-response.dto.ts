import { IsNotEmpty } from 'class-validator';
import { TimeState } from 'src/states/game.state.';

export class ChartResponseDto {
  @IsNotEmpty()
  gameId: string;

  @IsNotEmpty()
  nextTIme: TimeState;
}
