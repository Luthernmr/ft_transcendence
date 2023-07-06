import { IsString, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  text: string;
  
  @IsNotEmpty()
  room: string;
  
  @IsNotEmpty()
  user: string;
}
