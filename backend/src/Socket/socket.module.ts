/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Module({
    providers: [SocketGateway],
})
export class SocketModule {}
