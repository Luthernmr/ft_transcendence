/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { UserService } from './user.service';
import { UserModule } from './user.module';

@Module({
	imports : [UserModule],
    providers: [SocketGateway],
})
export class SocketModule {}
