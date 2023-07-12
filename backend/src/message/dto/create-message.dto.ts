import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  userId(userId: any) {
    throw new Error('Method not implemented.');
  }
  roomId(roomId: any) {
    throw new Error('Method not implemented.');
  }
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsNotEmpty()
  room: string;

  @IsNotEmpty()
  user: string;
}
