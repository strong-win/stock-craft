import { IsNotEmpty } from 'class-validator';

export class CreatePlayerDto {
  @IsNotEmpty()
  clientId: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  room: string;
}
