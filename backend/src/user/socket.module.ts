import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { UserModule } from './user.module';
import { AuthModule } from 'src/auth/auth.module';
import { FriendModule } from 'src/social/friend.module';
import { PongModule } from 'src/pong/pong.module';
import { GlobalGateway } from 'src/websockets/global.gateway';

@Module({
  imports: [UserModule, AuthModule, FriendModule, PongModule],
  providers: [SocketGateway, GlobalGateway],
})
export class SocketModule {}
