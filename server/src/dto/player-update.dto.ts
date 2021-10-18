import { IsOptional } from 'class-validator';
import { PlayerStatus, Asset } from './../schemas/players.schema';

export class PlayerUpdateDto {
  @IsOptional()
  status?: PlayerStatus;

  @IsOptional()
  gameId?: string;

  @IsOptional()
  assets?: Asset[];

  @IsOptional()
  cash?: number;
}
