import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Room } from 'src/room/entities/room.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/room/entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Message])],
  providers: [ChatService]
})
export class ChatModule {}
