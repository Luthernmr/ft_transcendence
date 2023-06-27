import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PongGateway } from './pong.gateway';
import { PongService } from './pong.service';
import { PongHistory } from './pong.entity'

@Module({
	imports: [TypeOrmModule.forFeature([PongHistory])],
	providers: [PongGateway, PongService],
})
export class PongModule {}
