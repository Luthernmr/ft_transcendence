import { Injectable } from '@nestjs/common';
import { PongGateway } from './pong.gateway'
import { Socket } from 'socket.io';
import { ReturningStatementNotSupportedError } from 'typeorm';

interface PongRuntimeData {
	socket: Socket,
	ballX: number,
	ballY: number,
	dX: number,
	dY: number,
}

@Injectable()
export class PongService {
	runtimeDatas: PongRuntimeData[] = [];
	pongGateway : PongGateway;
	
	constructor() {
		
	}

	RegisterGateway(pongGateway : PongGateway) {
		this.pongGateway = pongGateway;
	}

	LaunchUpdates() {
		setInterval(this.GlobalUpdate.bind(this), 1000);
	}

	StartRoom(datas: PongRuntimeData) {
		this.runtimeDatas.push(datas);
	}

	CloseRoom(socketID: string) {
		this.runtimeDatas.forEach(function (data) {
			if (data.socket.id === socketID) {
				const index = this.runtimeDatas.indexOf(data);
				this.runtimeDatas.splice(index, 1);
				console.log("Closed room");
				return;
			}
		})
	}

	GlobalUpdate() {
		console.log("PongService Updating...");
		this.runtimeDatas.forEach(function (data) {
			console.log("Updating room...");
			data.dX = -data.dX;
			data.dY = -data.dY;
			this.pongGateway.EmitChangeDir(data);
		}, this)
	}
}
