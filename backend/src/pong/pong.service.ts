import { Injectable } from '@nestjs/common';
import { PongGateway } from './pong.gateway'
import { Socket } from 'socket.io';

const SINGLE_PLAYER_MODE: boolean = true;

const FRAMERATE: number = 16 / 100;

const PONG_WIDTH: number = 600;
const PONG_HEIGHT: number = 400;
const BALL_RADIUS: number = 20;
const BALL_START_POS_X: number = 300;
const BALL_START_POS_Y: number = 200;

const BALL_START_DELTA_X: number = 30;
const BALL_START_DELTA_Y: number = 30;

const BASE_INIT_DATAS: PongInitData = {
	width: PONG_WIDTH,
	height: PONG_HEIGHT,
	ballRadius: BALL_RADIUS,
	ballStartPosition: {x: BALL_START_POS_X, y: BALL_START_POS_Y},
	ballStartDelta: {x: 0, y: 0}
}

export interface Vector2 {
	x: number,
	y: number
}

export interface PongInitData {
	width: number,
	height: number,
	ballRadius: number,
	ballStartPosition: Vector2,
	ballStartDelta: Vector2
}

export interface PongRuntimeData {
	socketP1: Socket,
	socketP2: Socket,
	ballPosition: Vector2,
	ballDelta: Vector2,
	collided: boolean
}

@Injectable()
export class PongService {
	runtimeDatas: Array<PongRuntimeData>;
	pendingPlayers: Socket[];

	pongGateway : PongGateway;
	
	constructor() {
		this.runtimeDatas = [];
		this.pendingPlayers = [];
	}

	RegisterGateway(pongGateway : PongGateway) {
		this.pongGateway = pongGateway;
	}

	LaunchUpdates() {
		setInterval(this.GlobalUpdate.bind(this), 16);
	}

	Init(socket: Socket): PongInitData {		
		this.pendingPlayers.push(socket);
		return { ...BASE_INIT_DATAS };
	}

	FindIndexBySocketId(socketID: string): number {
		return this.runtimeDatas.findIndex(data => (data.socketP1.id === socketID || data.socketP2.id === socketID));
	}

	GetOpponent(socket: Socket): Socket {
		const currentIndex = this.pendingPlayers.findIndex(player => player.id === socket.id);
		this.pendingPlayers.splice(currentIndex, 1);
		const opponent = this.pendingPlayers[0];
		this.pendingPlayers.splice(0, 1);
		return opponent;
	}

	StartRoom(socket: Socket): boolean {
		const index = this.FindIndexBySocketId(socket.id);
		if (index >= 0)
		{
			console.log("Reinitializing pong room");
			this.runtimeDatas[index].ballPosition = { ...BASE_INIT_DATAS.ballStartPosition };
			this.runtimeDatas[index].ballDelta = {x: BALL_START_DELTA_X, y: BALL_START_DELTA_Y};
			this.pongGateway.EmitChangeDir(this.runtimeDatas[index]);
			return true;
		}
		
		if (this.pendingPlayers.length <= 1) {
			console.log("No other player connected");
			return false;
		}

		const opponent = this.GetOpponent(socket);
		console.log("Starting new pong room");
		const datas: PongRuntimeData = {
			socketP1: socket,
			socketP2: opponent,
			ballPosition: { ...BASE_INIT_DATAS.ballStartPosition },
			ballDelta: {x: BALL_START_DELTA_X, y: BALL_START_DELTA_Y},
			collided: false
		};
		
		this.runtimeDatas.push(datas);
		this.pongGateway.EmitChangeDir(datas);
		return true;
	}

	CloseRoom(socketID: string) {
		console.log("Closing pong room");

		const index: number = this.FindIndexBySocketId(socketID);
		console.log("Found index: " + index);
		

		if (index >= 0)
			this.runtimeDatas.splice(index, 1);
	}

	GlobalUpdate() {
		//console.log("PongService Updating...");
		this.runtimeDatas.forEach(function (data) {
			//console.log("Updating room...");
			
			const oldDelta: Vector2 = { ...data.ballDelta};

			data.ballPosition.x += data.ballDelta.x * FRAMERATE;
			data.ballPosition.y += data.ballDelta.y * FRAMERATE;

			if (data.ballPosition.x <= 0) {
				data.ballDelta.x = -data.ballDelta.x;
				data.ballPosition.x = 0;
			} else if (data.ballPosition.x >= PONG_WIDTH - BALL_RADIUS) {
				data.ballDelta.x = -data.ballDelta.x;
				data.ballPosition.x = PONG_WIDTH - BALL_RADIUS;
			}

			if (data.ballPosition.y <= 0){
				data.ballDelta.y = -data.ballDelta.y;
				data.ballPosition.y = 0;
			} else if (data.ballPosition.y >= PONG_HEIGHT - BALL_RADIUS) {
				data.ballDelta.y = -data.ballDelta.y;
				data.ballPosition.y = PONG_HEIGHT - BALL_RADIUS;
			}

			if (data.ballDelta.x != oldDelta.x || data.ballDelta.y != oldDelta.y) {
				console.log("Changing Direction");
				data.collided = true;
			}
		}, this);

		// Collisions
		const collisions = this.runtimeDatas.filter(data => data.collided);

		collisions.forEach(function(data) {
			this.pongGateway.EmitChangeDir(data);
			data.collided = false;
		}, this);
	}
}
