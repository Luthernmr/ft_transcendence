import { TwoFAService } from './auth/twofa.service';
import { FriendModule } from './social/friend.module';
import { Auth42Service } from './auth/auth42.service';
import { SocketModule } from './user/socket.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { Module } from '@nestjs/common';
import { BddModule } from './bdd/bdd.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PongModule } from './pong/pong.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ChatModule,
    FriendModule,
    UserModule,
    BddModule,
    AuthModule,
    SocketModule,
    PongModule,
    ConfigModule.forRoot(),
  ],
  controllers: [],
  providers: [Auth42Service, JwtService],
})
export class AppModule {}
