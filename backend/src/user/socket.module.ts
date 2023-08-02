import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { UserModule } from './user.module';
import { AuthModule } from 'src/auth/auth.module';
import { FriendModule } from 'src/social/friend.module';
import { PongModule } from 'src/pong/pong.module';
import { GlobalGateway } from 'src/websockets/global.gateway';
import { RoomService } from 'src/room/room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/message/entities/message.entity';
import { MutedUser } from 'src/room/entities/muted-user.entity';
import { Room } from 'src/room/entities/room.entity';
import { Friend } from 'src/social/friend.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Friend, Room, Message, MutedUser]),UserModule, AuthModule, FriendModule, PongModule],
  providers: [SocketGateway, GlobalGateway, RoomService],
})
export class SocketModule {}
