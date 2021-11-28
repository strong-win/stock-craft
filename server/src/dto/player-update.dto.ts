import { IsOptional } from 'class-validator';
import {
  PlayerStatus,
  Asset,
  Cash,
  PlayerOption,
} from '../schemas/player.schema';

export class PlayerUpdateDto {
  @IsOptional()
  status?: PlayerStatus;

  @IsOptional()
  gameId?: string;

  @IsOptional()
  cash?: Cash;

  @IsOptional()
  assets?: Asset[];

  @IsOptional()
  option?: PlayerOption;
}
