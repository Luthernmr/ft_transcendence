import { Injectable } from '@nestjs/common';
import { PongGateway } from './pong.gateway'

@Injectable()
export class PongService {
	pongGateway: PongGateway;

	constructor() {
		//setInterval(this.pongGateway.updateBall, 120);
	}
}
