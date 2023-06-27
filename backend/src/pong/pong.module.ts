import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PongGateway } from './pong.gateway';
import { PongService } from './pong.service';
import { PongEntity } from './pong.entity'

@Module({
	imports: [TypeOrmModule.forFeature([PongEntity])],
	providers: [PongGateway, PongService],
})
export class PongModule {}
