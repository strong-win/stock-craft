import { IsNotEmpty } from 'class-validator';

export class ErrorInterface {
  @IsNotEmpty()
  message: string;
}
