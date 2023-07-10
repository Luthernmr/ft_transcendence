import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PongGateway } from './pong.gateway';
import { PongService } from './pong.service';
import { PongHistory } from 'src/pong/pongHistory.entity'
import { HistoryService } from './history.service';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { GlobalGateway } from 'src/websockets/global.gateway';

@Module({
	imports: [TypeOrmModule.forFeature([PongHistory]), UserModule, AuthModule],
	providers: [PongGateway, PongService, HistoryService, GlobalGateway],
	exports: [TypeOrmModule, HistoryService, PongService]
})
export class PongModule {}
