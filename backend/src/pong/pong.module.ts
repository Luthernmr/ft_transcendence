import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PongGateway } from './pong.gateway';
import { PongService } from './pong.service';
import { PongHistory } from 'src/pong/pongHistory.entity'
import { HistoryService } from './history.service';

@Module({
	imports: [TypeOrmModule.forFeature([PongHistory])],
	providers: [PongGateway, PongService, HistoryService],
	exports: [TypeOrmModule, HistoryService]
})
export class PongModule {}
