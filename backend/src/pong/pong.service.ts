import { Injectable } from '@nestjs/common';
import { PongGateway } from './pong.gateway'
import { Socket } from 'dgram';

interface PongRuntimeData {
	socket: Socket,
	ballX: number,
	ballY: number,
	deltaX: number,
	deltaY: number,
}

@Injectable()
export class PongService {
	runtimeDatas: PongRuntimeData[];
	
	constructor(private readonly pongGateway : PongGateway) {
		
	}


}
