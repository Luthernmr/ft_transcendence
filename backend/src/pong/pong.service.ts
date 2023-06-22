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

const PADDLE_WIDTH: number = 10;
const PADDLE_HEIGHT: number = 100;
const PADDLE_START_HEIGHT: number = 200;

const PADDLE_SPEED: number = 20;

const BASE_INIT_DATAS: PongInitData = {
	width: PONG_WIDTH,
	height: PONG_HEIGHT,
	ballRadius: BALL_RADIUS,
	ballStartPosition: {x: BALL_START_POS_X, y: BALL_START_POS_Y},
	ballStartDelta: {x: 0, y: 0},
	paddleWidth: PADDLE_WIDTH,
	paddleHeight: PADDLE_HEIGHT,
	paddleStartHeight: PADDLE_START_HEIGHT
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
	ballStartDelta: Vector2,
	paddleWidth: number,
	paddleHeight: number
	paddleStartHeight: number,
}

export interface PongRuntimeData extends BallRuntimeData, PaddleRuntimeData {
	socketP1: Socket,
	socketP2: Socket,
}

export interface BallRuntimeData {
	ballPosition: Vector2,
	ballDelta: Vector2,
	collided: boolean
}

export interface PaddleRuntimeData {
	paddle1Height: number,
	paddle1Delta: number,
	paddle2Height: number,
	paddle2Delta: number
}

@Injectable()
export class PongService {
	runtimeDatas: Array<PongRuntimeData>;
	ballEvents: Set<number>;
	paddleEvents: Set<number>;
	pendingPlayers: Socket[];

	pongGateway : PongGateway;
	
	constructor() {
		this.runtimeDatas = [];
		this.ballEvents = new Set<number>();
		this.paddleEvents = new Set<number>();
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
			paddle1Height: PADDLE_START_HEIGHT,
			paddle1Delta: 0,
			paddle2Height: PADDLE_START_HEIGHT,
			paddle2Delta: 0,
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
		
		if (index >= 0) {
			this.runtimeDatas.splice(index, 1);
		}

		const pendingIndex: number = this.pendingPlayers.findIndex(data => data.id === socketID);
		if (pendingIndex >= 0)
			this.pendingPlayers.splice(pendingIndex, 1);
	}

	PaddleKeyDown(socketID: string, input: number) {
		const instanceIndex = this.FindIndexBySocketId(socketID);
		if (instanceIndex < 0)
			return;
		
		if (this.runtimeDatas[instanceIndex].socketP1.id === socketID) {
			this.runtimeDatas[instanceIndex].paddle1Delta = input * PADDLE_SPEED;
		} else {
			this.runtimeDatas[instanceIndex].paddle2Delta = input * PADDLE_SPEED;
		}

		this.paddleEvents.add(instanceIndex);
	}

	PaddleKeyUp(socketID: string, input: number) {
		const instanceIndex = this.FindIndexBySocketId(socketID);
		if (instanceIndex < 0)
			return;

		if (this.runtimeDatas[instanceIndex].socketP1.id === socketID
			&& Math.sign(this.runtimeDatas[instanceIndex].paddle1Delta) === Math.sign(input)) {
			this.runtimeDatas[instanceIndex].paddle1Delta = 0;
		} else if (this.runtimeDatas[instanceIndex].socketP2.id === socketID
			&& Math.sign(this.runtimeDatas[instanceIndex].paddle2Delta) === Math.sign(input)) {
			this.runtimeDatas[instanceIndex].paddle2Delta = 0;
		} else
			return;

		this.paddleEvents.add(instanceIndex);
	}

	GlobalUpdate() {

		this.runtimeDatas.forEach(function (data, index) {
			
			const oldDelta: Vector2 = { ...data.ballDelta};

			data.ballPosition.x += data.ballDelta.x * FRAMERATE;
			data.ballPosition.y += data.ballDelta.y * FRAMERATE;

			const oldPaddle1Delta = data.paddle1Delta;
			const oldPaddle2Delta = data.paddle2Delta;

			data.paddle1Height += data.paddle1Delta * FRAMERATE;
			data.paddle2Height += data.paddle2Delta * FRAMERATE;

			if (data.paddle1Height < 0) {
				data.paddle1Delta = 0;
				data.paddle1Height = 0;
			} else if (data.paddle1Height > (PONG_HEIGHT - PADDLE_HEIGHT)) {
				data.paddle1Delta = 0;
				data.paddle1Height = PONG_HEIGHT - PADDLE_HEIGHT;
			}

			if (data.paddle2Height < 0) {
				data.paddle2Delta = 0;
				data.paddle2Height = 0;
			} else if (data.paddle2Height > (PONG_HEIGHT - PADDLE_HEIGHT)) {
				data.paddle2Delta = 0;
				data.paddle2Height = PONG_HEIGHT - PADDLE_HEIGHT;
			}

			if (oldPaddle1Delta != data.paddle1Delta || oldPaddle2Delta != data.paddle2Delta)
				this.paddleEvents.add(index);

			if (data.ballPosition.x < PADDLE_WIDTH) {
				if (data.paddle1Height < data.ballPosition.y && data.ballPosition.y < data.paddle1Height + PADDLE_HEIGHT) {
				data.ballDelta.x = -data.ballDelta.x;
				data.ballPosition.x = PADDLE_WIDTH;
				} else {
					this.StartRoom(data.socketP1);
					return;
				}
			} else if (data.ballPosition.x > (PONG_WIDTH - BALL_RADIUS - PADDLE_WIDTH)) {
				if (data.paddle2Height < data.ballPosition.y && data.ballPosition.y < data.paddle2Height + PADDLE_HEIGHT) {
					data.ballDelta.x = -data.ballDelta.x;
					data.ballPosition.x = PONG_WIDTH - BALL_RADIUS - PADDLE_WIDTH;
				} else {
					this.StartRoom(data.socketP1);
					return;
				}
			}

			if (data.ballPosition.y <= 0) {
				data.ballDelta.y = -data.ballDelta.y;
				data.ballPosition.y = 0;
			} else if (data.ballPosition.y >= PONG_HEIGHT - BALL_RADIUS) {
				data.ballDelta.y = -data.ballDelta.y;
				data.ballPosition.y = PONG_HEIGHT - BALL_RADIUS;
			}

			if (data.ballDelta.x != oldDelta.x || data.ballDelta.y != oldDelta.y)
				this.ballEvents.add(index);
		}, this);

		// Collisions
		this.ballEvents.forEach(function(index) {
			this.pongGateway.EmitChangeDir(this.runtimeDatas[index]);
		}, this);

		this.ballEvents.clear();

		// Paddles
		this.paddleEvents.forEach(function(index) {
			this.pongGateway.EmitPaddleDelta(this.runtimeDatas[index]);
		}, this);

		this.paddleEvents.clear();
	}
}
