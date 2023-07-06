import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  // @IsUUID()
  @IsNotEmpty()
  room: string;

  // @IsUUID()
  @IsNotEmpty()
  user: string;
}
