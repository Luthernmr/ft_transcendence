/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { AuthModule } from 'src/auth/auth.module';
import { FriendModule } from 'src/social/friend.module';
import { PongModule } from 'src/pong/pong.module';

@Module({
	imports : [UserModule,AuthModule,FriendModule, PongModule],
    providers: [SocketGateway],
})
export class SocketModule {}
