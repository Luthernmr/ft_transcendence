import { Injectable } from '@nestjs/common';
import { PongGateway } from './pong.gateway'
import { Socket } from 'socket.io';
import { HistoryService } from './history.service';
import { log } from 'console';

const COUNTDOWN: number = 3000;

const FRAMERATE: number = 16 / 100;

const PONG_WIDTH: number = 600;
const PONG_HEIGHT: number = 400;

const BALL_WIDTH: number = 20;
const BALL_HEIGHT: number = BALL_WIDTH;
const BALL_HEIGHT_CUSTOM: number = 50;
const BALL_CUSTOM_GAIN: number = 8;
const BALL_MAX_HEIGHT: number = 200;

const BALL_START_POS_X: number = 300;
const BALL_START_POS_Y: number = 200;

const BALL_SPEED: number = 6;

const OUTER_ANGLE_DELTA: number = 5 * BALL_SPEED;
const INNER_ANGLE_DELTA: number = 2.5 * BALL_SPEED;

const BALL_START_DELTA_X: number = OUTER_ANGLE_DELTA;
const BALL_START_DELTA_Y: number = BALL_START_DELTA_X;

const PADDLE_WIDTH: number = 20;
const PADDLE_HEIGHT: number = 100;
const PADDLE_HEIGHT_CUSTOM: number = PADDLE_WIDTH;

const PADDLE_SECTION: number = PADDLE_HEIGHT / 5;
const PADDLE_START_POS: number = 200;

const PADDLE_SPEED: number = 20;

const WIN_SCORE: number = 3;

export interface Vector2 {
	x: number,
	y: number
}

export interface GameLayout {
	width: number,
	height: number,
	ballWidth: number,
	paddleWidth: number,
}

export interface PongInitData extends GameLayout {
	ballPosition: Vector2,
	paddlePos: number,
}

const BASE_INIT_DATAS: PongInitData = {
	width: PONG_WIDTH,
	height: PONG_HEIGHT,
	ballWidth: BALL_WIDTH,
	paddleWidth: PADDLE_WIDTH,
	ballPosition: {x: BALL_START_POS_X, y: BALL_START_POS_Y},
	paddlePos: PADDLE_START_POS
}

export interface PongInitEntities {
	ballHeight: number,
	paddleHeight: number,
}

const STANDARD_ENTITIES: PongInitEntities = {
	ballHeight: BALL_HEIGHT,
	paddleHeight: PADDLE_HEIGHT
}

const CUSTOM_ENTITIES: PongInitEntities = {
	ballHeight: BALL_HEIGHT_CUSTOM,
	paddleHeight: PADDLE_HEIGHT_CUSTOM
}

const STANDARD_INIT_DATAS = { ...BASE_INIT_DATAS, ...STANDARD_ENTITIES };
const CUSTOM_INIT_DATAS = { ...BASE_INIT_DATAS, ...CUSTOM_ENTITIES }

export interface SocketPair {
	socketP1: Socket,
	socketP2: Socket
}

export interface BallRuntimeData {
	ballPosition: Vector2,
	ballDelta: Vector2,
	ballHeight: number
}

export interface PaddleRuntimeData {
	paddleHeight: number,
	paddle1Pos: number,
	paddle1Delta: number,
	paddle2Pos: number,
	paddle2Delta: number
}

export interface Score {
	scoreP1: number,
	scoreP2: number
}

export interface PlayerInfos {
	socket: Socket,
	userId: number
}

export interface IDPair {
	idP1: number,
	idP2: number
}

export interface WatcherInitDatas extends GameLayout, PongInitEntities, BallRuntimeData, PaddleRuntimeData, Score {

}

@Injectable()
export class PongService {
	pendingPlayers: PlayerInfos[];
	pendingPlayersCustom: PlayerInfos[];

	socketsRuntime: Array<SocketPair>;
	ballRuntime: Array<BallRuntimeData>;
	paddleRuntime: Array<PaddleRuntimeData>;

	ballRuntimeStandard: Array<BallRuntimeData>;
	ballRuntimeCustom: Array<BallRuntimeData>;

	ballEvents: Set<number>;
	paddleEvents: Set<number>;

	scoreData: Array<Score>;
	idPairs: Array<IDPair>;

	waitingState: Array<boolean>;

	roomID: Array<number>;
	maxRoomID: number;

	customMode: Array<boolean>;

	pongGateway : PongGateway;
	
	constructor(private readonly historyService: HistoryService) {
		this.pendingPlayers = [];
		this.pendingPlayersCustom = [];

		this.socketsRuntime = [];
		this.ballRuntime = [];
		this.paddleRuntime = [];

		this.ballRuntimeCustom = [];
		this.ballRuntimeStandard = [];

		this.ballEvents = new Set<number>();
		this.paddleEvents = new Set<number>();

		this.scoreData = [];
		this.idPairs = [];

		this.waitingState = [];

		this.roomID = [];
		this.maxRoomID = -1;

		this.customMode = [];
	}

	RegisterGateway(pongGateway : PongGateway) {
		this.pongGateway = pongGateway;
	}

	LaunchUpdates() {
		setInterval(this.GlobalUpdate.bind(this), 16);
	}

	FindIndexBySocketId(socketID: string): number {
		return this.socketsRuntime.findIndex(sockets => (sockets.socketP1.id === socketID || sockets.socketP2.id === socketID));
	}

	JoinQueue(socket: Socket, userId: number, custom: boolean = false) {
		const currentPlayer = {
			socket: socket,
			userId: userId,
		};
		
		const pendingPlayersArray = custom ? this.pendingPlayersCustom : this.pendingPlayers;

		if (pendingPlayersArray.length >= 1) {
			const opponent = pendingPlayersArray[0];
			pendingPlayersArray.splice(0, 1);

			this.CreateRoom(currentPlayer, opponent, custom);
		} else {
			pendingPlayersArray.push({
				socket: socket,
				userId: userId,
			});
		}
	}

	CreateRoom(player1: PlayerInfos, player2: PlayerInfos, custom: boolean = false) {

		this.maxRoomID++;
		const roomIndex = this.maxRoomID;

		this.roomID.push(roomIndex);
		
		this.customMode.push(custom);
		
		const sockets: SocketPair = {
			socketP1: player1.socket,
			socketP2: player2.socket
		}

		this.socketsRuntime.push(sockets);

		const roomName = "room" + roomIndex;

		sockets.socketP1.join(roomName);
		sockets.socketP2.join(roomName);

		const ids: IDPair = {
			idP1: player1.userId,
			idP2: player2.userId
		}

		this.idPairs.push(ids);

		const ball: BallRuntimeData = {
			ballPosition: { ...BASE_INIT_DATAS.ballPosition },
			ballDelta: {x: 0, y: 0},
			ballHeight: custom ? CUSTOM_ENTITIES.ballHeight : STANDARD_ENTITIES.ballHeight,
		};

		this.ballRuntime.push(ball);

		custom ? this.ballRuntimeCustom.push(ball) : this.ballRuntimeStandard.push(ball);

		const paddles: PaddleRuntimeData = {
			paddleHeight: custom ? CUSTOM_ENTITIES.paddleHeight : STANDARD_ENTITIES.paddleHeight,
			paddle1Pos: PADDLE_START_POS,
			paddle1Delta: 0,
			paddle2Pos: PADDLE_START_POS,
			paddle2Delta: 0
		}

		this.paddleRuntime.push(paddles);

		const score: Score = {
			scoreP1: 0,
			scoreP2: 0
		}

		this.scoreData.push(score);

		this.waitingState.push(false);

		//const init_datas = custom ? {...CUSTOM_INIT_DATAS} : {...STANDARD_INIT_DATAS};

		this.pongGateway.EmitInit(roomIndex, custom ? CUSTOM_INIT_DATAS : STANDARD_INIT_DATAS);

		this.pongGateway.EmitStartGame(roomIndex, COUNTDOWN / 1000);

		this.StartGameAtCountdown(this.socketsRuntime.length - 1, COUNTDOWN);
	}

	AddWatcher(index: number, socket: Socket) {
		if (this.roomID.length > 0) {
			index = 0;
			socket.join("room" + this.roomID[index]);
			
			const initDatas = this.customMode[index] ? CUSTOM_INIT_DATAS : STANDARD_INIT_DATAS;

			this.pongGateway.EmitWatcher(socket, {
				...initDatas,
				...this.ballRuntime[index],
				...this.paddleRuntime[index],
				...this.scoreData[index]
			});
			console.log("Joined room Id: " + this.roomID[0]);
		} else
			console.log("No room is currently running!");
	}

	RemoveWatcher(index: number, socket: Socket) {
		socket.leave("room" + this.roomID[index]);
	}

	async StartGameAtCountdown(index: number, countdown: number) {
		await new Promise(r => setTimeout(r, countdown));
		this.ballRuntime[index].ballDelta = {x: BALL_START_DELTA_X, y: BALL_START_DELTA_Y};
		this.pongGateway.EmitBallDelta(this.roomID[index], this.ballRuntime[index]);
	}

	RestartGame(index: number) {
		this.ballRuntime[index].ballPosition = { ...BASE_INIT_DATAS.ballPosition };
		this.ballRuntime[index].ballDelta = {x: 0, y: 0};

		this.pongGateway.EmitBallDelta(this.roomID[index], this.ballRuntime[index]);
		this.pongGateway.EmitStartGame(this.roomID[index], COUNTDOWN / 1000);
		
		this.StartGameAtCountdown(this.socketsRuntime.length - 1, COUNTDOWN);
	}

	CloseRoom(socketID: string) {
		console.log("Closing pong room");

		const index: number = this.FindIndexBySocketId(socketID);
		console.log("Found index: " + index);
		
		if (index >= 0) {
			this.CleanDatas(index);
			return;
		}

		const pendingIndex: number = this.pendingPlayers.findIndex(data => data.socket.id === socketID);
		if (pendingIndex >= 0)
			this.pendingPlayers.splice(pendingIndex, 1);
	}

	CleanDatas(index: number) {
		const ballRuntimeMode = this.customMode[index] ? this.ballRuntimeCustom : this.ballRuntimeStandard;
		const modeIndex = ballRuntimeMode.indexOf(this.ballRuntime[index]);
		ballRuntimeMode.splice(modeIndex, 1);

		this.customMode.splice(index, 1);
		this.socketsRuntime.splice(index, 1);
		this.ballRuntime.splice(index, 1);
		this.paddleRuntime.splice(index, 1);
		this.scoreData.splice(index, 1);
		this.idPairs.splice(index, 1);
		this.waitingState.splice(index, 1);
		this.pongGateway.CloseRoom(this.roomID[index]);
		this.roomID.splice(index, 1);
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
		this.pongGateway.EmitScore(this.roomID[index], this.scoreData[index]);
		if (this.scoreData[index].scoreP1 >= WIN_SCORE || this.scoreData[index].scoreP2 >= WIN_SCORE)
			this.EndGame(index);
		else
			this.RestartGame(index);
	}

	EndGame(index: number) {
		const winner: number = (this.scoreData[index].scoreP1 > this.scoreData[index].scoreP2) ? 1 : 2;

		this.ballRuntime[index].ballPosition = { ...BASE_INIT_DATAS.ballPosition };
		this.ballRuntime[index].ballDelta = {x: 0, y: 0};

		this.pongGateway.EmitBallDelta(this.roomID[index], this.ballRuntime[index]);
		this.pongGateway.EmitEnd(this.roomID[index], winner);

		this.historyService.addEntry(this.idPairs[index], this.scoreData[index]);
	}

	RestartNewGame(socket: Socket) {
		const index = this.FindIndexBySocketId(socket.id);

		if (this.waitingState[index] == false) {
			this.waitingState[index] = true;
			return;
		}

		this.waitingState[index] = false;

		const score: Score = {
			scoreP1: 0,
			scoreP2: 0
		}

		this.scoreData[index] = score;
		this.pongGateway.EmitScore(this.roomID[index], score);

		this.RestartGame(index);
	}

	GlobalUpdate() {
		// PADDLE CALCULATIONS
		this.paddleRuntime.forEach(function (data, index) {
			const oldPaddle1Delta = data.paddle1Delta;
			const oldPaddle2Delta = data.paddle2Delta;

			data.paddle1Pos += data.paddle1Delta * FRAMERATE;
			data.paddle2Pos += data.paddle2Delta * FRAMERATE;

			if (data.paddle1Pos < 0) {
				data.paddle1Delta = 0;
				data.paddle1Pos = 0;
			} else if (data.paddle1Pos > (PONG_HEIGHT - data.paddleHeight)) {
				data.paddle1Delta = 0;
				data.paddle1Pos = PONG_HEIGHT - data.paddleHeight;
			}

			if (data.paddle2Pos < 0) {
				data.paddle2Delta = 0;
				data.paddle2Pos = 0;
			} else if (data.paddle2Pos > (PONG_HEIGHT - data.paddleHeight)) {
				data.paddle2Delta = 0;
				data.paddle2Pos = PONG_HEIGHT - data.paddleHeight;
			}

			if (oldPaddle1Delta != data.paddle1Delta || oldPaddle2Delta != data.paddle2Delta)
				this.paddleEvents.add(index);
		}, this);

		// PADDLE EVENTS
		this.paddleEvents.forEach(function(index) {
			this.pongGateway.EmitPaddleDelta(this.roomID[index], this.paddleRuntime[index]);
		}, this);

		this.paddleEvents.clear();

		const oldBallDelta = this.ballRuntime.map(data => ({
			...data.ballDelta,
		}));

		// BALL CALCULATIONS
		this.ballRuntime.forEach(function (data, index) {

			data.ballPosition.x += data.ballDelta.x * FRAMERATE;
			data.ballPosition.y += data.ballDelta.y * FRAMERATE;

			if (data.ballPosition.y <= 0) {
				data.ballDelta.y = -data.ballDelta.y;
				data.ballPosition.y = 0;
			} else if (data.ballPosition.y >= PONG_HEIGHT - data.ballHeight) {
				data.ballDelta.y = -data.ballDelta.y;
				data.ballPosition.y = PONG_HEIGHT - data.ballHeight;
			}
		}, this);

		this.ballRuntimeStandard.forEach((data, index) => {
			const paddles = this.paddleRuntime[index];

			function paddleCollision(paddleHeight: number) : number {
				if (data.ballPosition.y < (paddleHeight - data.ballHeight) || (paddleHeight + PADDLE_HEIGHT) < data.ballPosition.y)
					return 0;

				if ((paddleHeight - data.ballHeight) <= data.ballPosition.y && data.ballPosition.y < (paddleHeight + 0.5 * PADDLE_SECTION))
					return 1;
				else if ((paddleHeight + 0.5 * PADDLE_SECTION) <= data.ballPosition.y && data.ballPosition.y < (paddleHeight + 1.5 * PADDLE_SECTION))
					return 2;
				else if ((paddleHeight + 1.5 * PADDLE_SECTION) <= data.ballPosition.y && data.ballPosition.y < (paddleHeight + 2.5 * PADDLE_SECTION))
					return 3;
				else if ((paddleHeight + 2.5 * PADDLE_SECTION) <= data.ballPosition.y && data.ballPosition.y < (paddleHeight + 3.5 * PADDLE_SECTION))
					return 4;
				else if ((paddleHeight + 3.5 * PADDLE_SECTION) <= data.ballPosition.y && data.ballPosition.y <= (paddleHeight + PADDLE_HEIGHT))
					return 5;
				
				return 0;
			}

			function bounceBall(paddleSection: number) {
				let angle: number = 0;

				switch (paddleSection) {
					case 1:
						angle = -OUTER_ANGLE_DELTA;
						break;
					case 2:
						angle = -INNER_ANGLE_DELTA;
						break;
					case 4:
						angle = INNER_ANGLE_DELTA;
						break;
					case 5:
						angle = OUTER_ANGLE_DELTA;
						break;
					default:
						break;
				}

				data.ballDelta.x = -data.ballDelta.x;
				data.ballDelta.y = angle;
			}

			if (data.ballPosition.x < PADDLE_WIDTH) {
				const paddleSection = paddleCollision(paddles.paddle1Pos);
				if (paddleSection > 0) {
					bounceBall(paddleSection);
					data.ballPosition.x = PADDLE_WIDTH;
				} else {
					this.scoreData[index].scoreP2 += 1;
					this.OnPlayerWin(index);
					return;
				}
			} else if (data.ballPosition.x > (PONG_WIDTH - BALL_WIDTH - PADDLE_WIDTH)) {
				const paddleSection = paddleCollision(paddles.paddle2Pos);
				if (paddleSection > 0) {
					bounceBall(paddleSection);
					data.ballPosition.x = PONG_WIDTH - BALL_WIDTH - PADDLE_WIDTH;
				} else {
					this.scoreData[index].scoreP1 += 1;
					this.OnPlayerWin(index);
					return;
				}
			}
		}, this);

		this.ballRuntimeCustom.forEach((data, index) => {
			const paddles = this.paddleRuntime[index];

			function paddleCollision(paddlePos: number, paddleHeight: number) : number {
				if (data.ballPosition.y < (paddlePos - data.ballHeight) || (paddlePos + paddleHeight) < data.ballPosition.y)
					return 0;
				
				return 1;
			}

			function bounceBall(paddleSection: number) {
				let angle: number = 0;

				switch (paddleSection) {
					case 1:
						angle = -OUTER_ANGLE_DELTA;
						break;
					case 2:
						angle = -INNER_ANGLE_DELTA;
						break;
					case 4:
						angle = INNER_ANGLE_DELTA;
						break;
					case 5:
						angle = OUTER_ANGLE_DELTA;
						break;
					default:
						break;
				}

				data.ballDelta.x = -data.ballDelta.x;
				data.ballDelta.y = angle;
			}

			function getRandomInt(min, max) {
				min = Math.ceil(min);
				max = Math.floor(max);
				return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
			}

			if (data.ballPosition.x < PADDLE_WIDTH / 2) {
				if (paddleCollision(paddles.paddle1Pos, paddles.paddleHeight)) {
					this.scoreData[index].scoreP2 += 1;
					this.OnPlayerWin(index);
				} else {
					bounceBall(getRandomInt(1, 6));
					data.ballPosition.x = PADDLE_WIDTH;
					const ballHeight = Math.min(data.ballHeight + BALL_CUSTOM_GAIN, BALL_MAX_HEIGHT);
					data.ballHeight = ballHeight;
					return;
				}
			} else if (data.ballPosition.x > (PONG_WIDTH - BALL_WIDTH - (PADDLE_WIDTH / 2))) {
				if (paddleCollision(paddles.paddle2Pos, paddles.paddleHeight)) {
					this.scoreData[index].scoreP1 += 1;
					this.OnPlayerWin(index);
				} else {
					bounceBall(getRandomInt(1, 6));
					data.ballPosition.x = PONG_WIDTH - BALL_WIDTH - PADDLE_WIDTH;
					const ballHeight = Math.min(data.ballHeight + BALL_CUSTOM_GAIN, BALL_MAX_HEIGHT);
					data.ballHeight = ballHeight;
					return;
				}
			}
		})

		oldBallDelta.forEach((old, index) => {
			const currentDelta = this.ballRuntime[index].ballDelta;

			if (old.x != currentDelta.x || old.y != currentDelta.y)
				this.ballEvents.add(index);
		}, this);

		// BALL EVENTS
		this.ballEvents.forEach(function(index) {
			this.pongGateway.EmitBallDelta(this.roomID[index], this.ballRuntime[index]);
		}, this);

		this.ballEvents.clear();
	}
}
