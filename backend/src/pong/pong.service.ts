import { Injectable } from '@nestjs/common';
import { PongGateway } from './pong.gateway'
import { Socket } from 'socket.io';

const SINGLE_PLAYER_MODE: boolean = true;

const COUNTDOWN: number = 3000;

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
	startCountdown: COUNTDOWN,
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
	startCountdown: number,
	width: number,
	height: number,
	ballRadius: number,
	ballStartPosition: Vector2,
	ballStartDelta: Vector2,
	paddleWidth: number,
	paddleHeight: number
	paddleStartHeight: number,
}

export interface SocketPair {
	socketP1: Socket,
	socketP2: Socket
}

export interface BallRuntimeData {
	ballPosition: Vector2,
	ballDelta: Vector2
}

export interface PaddleRuntimeData {
	paddle1Height: number,
	paddle1Delta: number,
	paddle2Height: number,
	paddle2Delta: number
}

export interface Score {
	scoreP1: number,
	scoreP2: number
}

@Injectable()
export class PongService {
	pendingPlayers: Socket[];

	socketsRuntime: Array<SocketPair>;
	ballRuntime: Array<BallRuntimeData>;
	paddleRuntime: Array<PaddleRuntimeData>;

	ballEvents: Set<number>;
	paddleEvents: Set<number>;

	scoreData: Array<Score>;

	pongGateway : PongGateway;
	
	constructor() {
		this.pendingPlayers = [];

		this.socketsRuntime = [];
		this.ballRuntime = [];
		this.paddleRuntime = [];

		this.ballEvents = new Set<number>();
		this.paddleEvents = new Set<number>();

		this.scoreData = [];
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
		return this.socketsRuntime.findIndex(sockets => (sockets.socketP1.id === socketID || sockets.socketP2.id === socketID));
	}

	GetOpponent(socket: Socket): Socket {
		const opponent = this.pendingPlayers[0];
		this.pendingPlayers.splice(0, 1);
		return opponent;
	}

	JoinQueue(socket: Socket) {
		if (this.pendingPlayers.length >= 1) {
			const opponent = this.GetOpponent(socket);
			this.CreateRoom(socket, opponent);
		} else {
			this.pendingPlayers.push(socket);
		}
	}

	CreateRoom(socket1: Socket, socket2: Socket) {
		console.log("Creating new pong room with sockets " + socket1 + " & " + socket2);
		
		const sockets: SocketPair = {
			socketP1: socket1,
			socketP2: socket2
		}

		this.socketsRuntime.push(sockets);

		const ball: BallRuntimeData = {
			ballPosition: { ...BASE_INIT_DATAS.ballStartPosition },
			ballDelta: {x: 0, y: 0},
		};

		this.ballRuntime.push(ball);

		const paddles: PaddleRuntimeData = {
			paddle1Height: PADDLE_START_HEIGHT,
			paddle1Delta: 0,
			paddle2Height: PADDLE_START_HEIGHT,
			paddle2Delta: 0
		}

		this.paddleRuntime.push(paddles);

		const score: Score = {
			scoreP1: 0,
			scoreP2: 0
		}

		this.scoreData.push(score);

		this.pongGateway.EmitInit(sockets, { ...BASE_INIT_DATAS });
		this.pongGateway.EmitStartGame(sockets, COUNTDOWN / 1000);

		this.StartGameAtCountdown(this.socketsRuntime.length - 1, COUNTDOWN);
	}

	async StartGameAtCountdown(index: number, countdown: number) {
		await new Promise(r => setTimeout(r, countdown));
		this.ballRuntime[index].ballDelta = {x: BALL_START_DELTA_X, y: BALL_START_DELTA_Y};
		this.pongGateway.EmitBallDelta(this.socketsRuntime[index], this.ballRuntime[index]);
	}

	RestartGame(index: number) {
		this.ballRuntime[index].ballPosition = { ...BASE_INIT_DATAS.ballStartPosition };
		this.ballRuntime[index].ballDelta = {x: 0, y: 0};

		this.pongGateway.EmitBallDelta(this.socketsRuntime[index], this.ballRuntime[index]);
		this.pongGateway.EmitStartGame(this.socketsRuntime[index], COUNTDOWN / 1000);
		
		this.StartGameAtCountdown(this.socketsRuntime.length - 1, COUNTDOWN);
	}

	CloseRoom(socketID: string) {
		console.log("Closing pong room");

		const index: number = this.FindIndexBySocketId(socketID);
		console.log("Found index: " + index);
		
		if (index >= 0) {
			this.socketsRuntime.splice(index, 1);
			this.ballRuntime.splice(index, 1);
			this.paddleRuntime.splice(index, 1);
			this.scoreData.splice(index, 1);
		}

		const pendingIndex: number = this.pendingPlayers.findIndex(data => data.id === socketID);
		if (pendingIndex >= 0)
			this.pendingPlayers.splice(pendingIndex, 1);
	}

	PaddleKeyDown(socketID: string, input: number) {
		const instanceIndex = this.FindIndexBySocketId(socketID);
		if (instanceIndex < 0)
			return;
		
		if (this.socketsRuntime[instanceIndex].socketP1.id === socketID) {
			this.paddleRuntime[instanceIndex].paddle1Delta = input * PADDLE_SPEED;
		} else {
			this.paddleRuntime[instanceIndex].paddle2Delta = input * PADDLE_SPEED;
		}

		this.paddleEvents.add(instanceIndex);
	}

	PaddleKeyUp(socketID: string, input: number) {
		const instanceIndex = this.FindIndexBySocketId(socketID);
		if (instanceIndex < 0)
			return;

		if (this.socketsRuntime[instanceIndex].socketP1.id === socketID
			&& Math.sign(this.paddleRuntime[instanceIndex].paddle1Delta) === Math.sign(input)) {
			this.paddleRuntime[instanceIndex].paddle1Delta = 0;
		} else if (this.socketsRuntime[instanceIndex].socketP2.id === socketID
			&& Math.sign(this.paddleRuntime[instanceIndex].paddle2Delta) === Math.sign(input)) {
			this.paddleRuntime[instanceIndex].paddle2Delta = 0;
		} else
			return;

		this.paddleEvents.add(instanceIndex);
	}

	OnPlayerWin(index: number) {
		this.pongGateway.EmitScore(this.socketsRuntime[index], this.scoreData[index]);
		this.RestartGame(index);
	}

	GlobalUpdate() {

		// PADDLE CALCULATIONS
		this.paddleRuntime.forEach(function (data, index) {
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
		}, this);

		// PADDLE EVENTS
		this.paddleEvents.forEach(function(index) {
			this.pongGateway.EmitPaddleDelta(this.socketsRuntime[index], this.paddleRuntime[index]);
		}, this);

		this.paddleEvents.clear();

		// BALL CALCULATIONS
		this.ballRuntime.forEach(function (data, index) {
			
			const paddles = this.paddleRuntime[index];

			const oldDelta: Vector2 = { ...data.ballDelta};

			data.ballPosition.x += data.ballDelta.x * FRAMERATE;
			data.ballPosition.y += data.ballDelta.y * FRAMERATE;

			if (data.ballPosition.x < PADDLE_WIDTH) {
				if (paddles.paddle1Height < data.ballPosition.y && data.ballPosition.y < paddles.paddle1Height + PADDLE_HEIGHT) {
				data.ballDelta.x = -data.ballDelta.x;
				data.ballPosition.x = PADDLE_WIDTH;
				} else {
					this.scoreData[index].scoreP2 += 1;
					this.OnPlayerWin(index);
					return;
				}
			} else if (data.ballPosition.x > (PONG_WIDTH - BALL_RADIUS - PADDLE_WIDTH)) {
				if (paddles.paddle2Height < data.ballPosition.y && data.ballPosition.y < paddles.paddle2Height + PADDLE_HEIGHT) {
					data.ballDelta.x = -data.ballDelta.x;
					data.ballPosition.x = PONG_WIDTH - BALL_RADIUS - PADDLE_WIDTH;
				} else {
					this.scoreData[index].scoreP1 += 1;
					this.OnPlayerWin(index);
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

		// BALL EVENTS
		this.ballEvents.forEach(function(index) {
			this.pongGateway.EmitBallDelta(this.socketsRuntime[index], this.ballRuntime[index]);
		}, this);

		this.ballEvents.clear();
	}
}
