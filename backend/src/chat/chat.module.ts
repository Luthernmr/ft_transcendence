import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Room } from 'src/room/entities/room.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/room/entities/message.entity';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { FriendModule } from 'src/social/friend.module';
import { RoomService } from 'src/room/room.service';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Message]), UserModule, AuthModule, FriendModule],
  providers: [ChatService, RoomService]
})
export class ChatModule {}
