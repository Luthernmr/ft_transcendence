import { Module } from '@nestjs/common';
import { PongGateway } from './pong.gateway';
import { PongService } from './pong.service';

@Module({
	imports: [],
	providers: [PongGateway, PongService],
})
export class PongModule {}
