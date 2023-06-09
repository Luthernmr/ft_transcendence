import { Injectable } from '@nestjs/common';
import { PongGateway } from './pong.gateway'
import { Socket } from 'socket.io';
import { ReturningStatementNotSupportedError } from 'typeorm';

interface PongRuntimeData {
	socket: Socket,
	ballX: number,
	ballY: number,
	ballRadius: number,
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
		setInterval(this.GlobalUpdate.bind(this), 16);
	}

	StartRoom(socket: Socket) {
		const datas: PongRuntimeData = {
			socket: socket,
			ballX: 390,
			ballY: 290,
			ballRadius: 20,
			dX: 30,
			dY: 30,
		};
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
		//console.log("PongService Updating...");
		this.runtimeDatas.forEach(function (data) {
			//console.log("Updating room...");
			
			const odX = data.dX;
			const odY = data.dY;

			data.ballX += data.dX * (16 / 100);
			data.ballY += data.dY * (16 / 100);

			if (data.ballX <= 90) { // leftWall.x + wallWidth
				data.ballX = 90;
				data.dX = -data.dX;
				console.log("Touched left wall: " + data.ballX + ", " + data.dX);
			} else if (data.ballX >= 660) { // rightWall.x - ballRadius
				data.ballX = 660;
				data.dX = -data.dX;
				console.log("Touched right wall: " + data.ballX + ", " + data.dX);
			}

			if (data.ballY <= 50){
				data.ballY = 50;
				data.dY = -data.dY;
				console.log("Touched up wall: " + data.ballY + ", " + data.dY);
			} else if (data.ballY >= 430) {
				data.ballY = 430;
				data.dY = -data.dY;
				console.log("Touched bottom wall: " + data.ballY + ", " + data.dY);
			}


			if (data.dX != odX || data.dY != odY)
				this.pongGateway.EmitChangeDir(data);

		}, this)
	}
}
