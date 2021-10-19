import { IsNotEmpty, IsOptional } from 'class-validator';
import { assetType } from 'src/schemas/players.schema';

export class CreatePlayerDto {
  @IsNotEmpty()
  clientId: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  room: string;

  @IsOptional()
  cash: number;

  @IsOptional()
  assets: assetType[];
}
