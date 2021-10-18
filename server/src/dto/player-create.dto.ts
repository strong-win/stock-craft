import { IsNotEmpty, IsOptional } from 'class-validator';
import { Asset, PlayerStatus } from 'src/schemas/players.schema';

export class PlayerCreateDto {
  @IsNotEmpty()
  clientId: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  room: string;

  @IsNotEmpty()
  status: PlayerStatus;

  @IsOptional()
  gameId?: number;

  @IsOptional()
  cash?: number;

  @IsOptional()
  assets?: Asset[];
}
