import { FriendModule } from './social/friend.module';
import { FriendController } from './social/friend.controller';
import { Auth42Controller } from './auth/auth42.controller';
import { Auth42Service } from './auth/auth42.service';
import { SocketModule } from './user/socket.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AuthService } from './auth/auth.service';
import { Module } from '@nestjs/common';
import { BddModule } from './bdd/bdd.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PongModule } from './pong/pong.module'


@Module({
	imports: [FriendModule, UserModule, BddModule, AuthModule, SocketModule, PongModule, ConfigModule.forRoot()],
	controllers: [],
	providers: [Auth42Service, JwtService]
})
export class AppModule { }
