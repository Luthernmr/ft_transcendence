import { Injectable } from '@nestjs/common';
import { PongGateway } from './pong.gateway'
import { Socket } from 'socket.io';
import { HistoryService } from './history.service';
import { log } from 'console';
import { User } from 'src/user/user.entity';

const COUNTDOWN: number = 3000;

const FRAMERATE: number = 16 / 100;

const PONG_WIDTH: number = 450;
const PONG_HEIGHT: number = 600;

const BALL_HEIGHT: number = 20;
const BALL_WIDTH: number = BALL_HEIGHT;
const BALL_WIDTH_CUSTOM: number = 50;
const BALL_CUSTOM_GAIN: number = 8;
const BALL_MAX_WIDTH: number = 200;

const BALL_START_POS_X: number = PONG_WIDTH / 2 - BALL_WIDTH / 2;
const BALL_START_POS_Y: number = PONG_HEIGHT / 2 - BALL_HEIGHT / 2;

const BALL_SPEED: number = 10;

const OUTER_ANGLE_DELTA: number = 5 * BALL_SPEED;
const INNER_ANGLE_DELTA: number = 2.5 * BALL_SPEED;

const BALL_START_DELTA_X: number = OUTER_ANGLE_DELTA;
const BALL_START_DELTA_Y: number = BALL_START_DELTA_X;

const PADDLE_HEIGHT: number = 20;
const PADDLE_WIDTH: number = 100;
const PADDLE_WIDTH_CUSTOM: number = PADDLE_HEIGHT;

const PADDLE_SECTION: number = PADDLE_WIDTH / 5;
const PADDLE_START_POS: number = 200;

const PADDLE_SPEED: number = 40;

const WIN_SCORE: number = 3;

export interface Vector2 {
	x: number,
	y: number
}

export interface GameLayout {
	width: number,
	height: number,
	ballHeight: number,
	paddleHeight: number,
}

export interface PongInitData extends GameLayout {
	ballPosition: Vector2,
	paddlePos: number,
}

const BASE_INIT_DATAS: PongInitData = {
	width: PONG_WIDTH,
	height: PONG_HEIGHT,
	ballHeight: BALL_HEIGHT,
	paddleHeight: PADDLE_HEIGHT,
	ballPosition: {x: BALL_START_POS_X, y: BALL_START_POS_Y},
	paddlePos: PADDLE_START_POS
}

export interface PongInitEntities {
	ballWidth: number,
	paddleWidth: number,
}

const STANDARD_ENTITIES: PongInitEntities = {
	ballWidth: BALL_WIDTH,
	paddleWidth: PADDLE_WIDTH
}

const CUSTOM_ENTITIES: PongInitEntities = {
	ballWidth: BALL_WIDTH_CUSTOM,
	paddleWidth: PADDLE_WIDTH_CUSTOM
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
	ballWidth: number
}

export interface PaddleRuntimeData {
	paddleWidth: number,
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
	playerInfos: PlayerInfos[];

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
		this.playerInfos = [];
		
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

	RegisterUserInfos(userID: number, socket: Socket) {
		const index = this.playerInfos.findIndex(infos => (infos.userId === userID));
		
		if (index > 0)
			this.playerInfos[index].socket = socket;
		else {
			
			this.playerInfos.push({userId: userID, socket: socket});
			//console.log('Added new user to pong playerInfos (id: ' + userID + ')');
		}
	}

	UnregisterUserInfos(socket: Socket) {
		const index = this.playerInfos.findIndex(infos => (infos.socket === socket));

		if (index >= 0)
			this.playerInfos.splice(index, 1);

		const pendingIndex: number = this.pendingPlayers.findIndex(data => data.socket === socket);
		if (pendingIndex >= 0)
			this.pendingPlayers.splice(pendingIndex, 1);

		const pendingCustomIndex: number = this.pendingPlayersCustom.findIndex(data => data.socket === socket);
		if (pendingIndex >= 0)
			this.pendingPlayersCustom.splice(pendingCustomIndex, 1);

		//console.log('User unregistered from pong');
	}

	LaunchUpdates() {
		setInterval(this.GlobalUpdate.bind(this), 16);
	}

	FindIndexBySocketId(socketID: string): number {
		return this.socketsRuntime.findIndex(sockets => (sockets.socketP1.id === socketID || sockets.socketP2.id === socketID));
	}

	JoinQueue(socket: Socket, custom: boolean = false) {
		const currentPlayerIndex = this.playerInfos.findIndex(infos => (infos.socket === socket));

		if (currentPlayerIndex < 0) {
			//console.log('user not registered to pong');
			return;
		}

		const currentPlayer = this.playerInfos[currentPlayerIndex];
		const pendingPlayersArray = custom ? this.pendingPlayersCustom : this.pendingPlayers;

		//console.log('Joined queue, userID: ' + currentPlayer.userId);

		if (pendingPlayersArray.length >= 1) {
			const opponent = pendingPlayersArray[0];
			pendingPlayersArray.splice(0, 1);

			this.CreateRoom(currentPlayer, opponent, custom);
		} else {
			pendingPlayersArray.push(currentPlayer);
		}
	}

	AcceptInvitation(user1ID: number, user2ID: number, custom: boolean = false) {
		const user1Index = this.playerInfos.findIndex(infos => (infos.userId === user1ID));
		const user2Index = this.playerInfos.findIndex(infos => (infos.userId === user2ID));
		
		if (user1Index < 0 || user2Index < 0) {
			//console.log(
    //     'Error for users ',
    //     user1ID,
    //     ' & ',
    //     user2ID,
    //     ', indexes = ',
    //     user1Index,
    //     ' & ',
    //     user2Index,
    //   );
			return;
		}

		this.CreateRoom(this.playerInfos[user1Index], this.playerInfos[user2Index], custom);
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
			ballWidth: custom ? CUSTOM_ENTITIES.ballWidth : STANDARD_ENTITIES.ballWidth,
		};

		this.ballRuntime.push(ball);

		custom ? this.ballRuntimeCustom.push(ball) : this.ballRuntimeStandard.push(ball);

		const paddles: PaddleRuntimeData = {
			paddleWidth: custom ? CUSTOM_ENTITIES.paddleWidth : STANDARD_ENTITIES.paddleWidth,
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

		this.pongGateway.EmitPlayerNums(sockets);

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
			//console.log('Joined room Id: ' + this.roomID[0]);
		} //else
			//console.log("No room is currently running!");
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
		//console.log('Closing pong room');

		const index: number = this.FindIndexBySocketId(socketID);
		//console.log('Found index: ' + index);
		
		if (index >= 0) {
			this.CleanDatas(index);
			return;
		}
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
			} else if (data.paddle1Pos > (PONG_WIDTH - data.paddleWidth)) {
				data.paddle1Delta = 0;
				data.paddle1Pos = PONG_WIDTH - data.paddleWidth;
			}

			if (data.paddle2Pos < 0) {
				data.paddle2Delta = 0;
				data.paddle2Pos = 0;
			} else if (data.paddle2Pos > (PONG_WIDTH - data.paddleWidth)) {
				data.paddle2Delta = 0;
				data.paddle2Pos = PONG_WIDTH- data.paddleWidth;
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

			if (data.ballPosition.x <= 0) {
				data.ballDelta.x = -data.ballDelta.x;
				data.ballPosition.x = 0;
			} else if (data.ballPosition.x >= PONG_WIDTH - data.ballWidth) {
				data.ballDelta.x = -data.ballDelta.x;
				data.ballPosition.x = PONG_WIDTH - data.ballWidth;
			}
		}, this);

		this.ballRuntimeStandard.forEach((data, index) => {
			const paddles = this.paddleRuntime[index];

			function paddleCollision(paddleWidth: number) : number {
				if (data.ballPosition.x < (paddleWidth - data.ballWidth) || (paddleWidth + PADDLE_WIDTH) < data.ballPosition.x)
					return 0;

				if ((paddleWidth - data.ballWidth) <= data.ballPosition.x && data.ballPosition.x < (paddleWidth + 0.5 * PADDLE_SECTION))
					return 1;
				else if ((paddleWidth + 0.5 * PADDLE_SECTION) <= data.ballPosition.x && data.ballPosition.x < (paddleWidth + 1.5 * PADDLE_SECTION))
					return 2;
				else if ((paddleWidth + 1.5 * PADDLE_SECTION) <= data.ballPosition.x && data.ballPosition.x < (paddleWidth + 2.5 * PADDLE_SECTION))
					return 3;
				else if ((paddleWidth + 2.5 * PADDLE_SECTION) <= data.ballPosition.x && data.ballPosition.x < (paddleWidth + 3.5 * PADDLE_SECTION))
					return 4;
				else if ((paddleWidth + 3.5 * PADDLE_SECTION) <= data.ballPosition.x && data.ballPosition.x <= (paddleWidth + PADDLE_WIDTH))
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

				data.ballDelta.x = angle;
				data.ballDelta.y = -data.ballDelta.y;
			}

			if (data.ballPosition.y < PADDLE_HEIGHT) {
				const paddleSection = paddleCollision(paddles.paddle1Pos);
				if (paddleSection > 0) {
					bounceBall(paddleSection);
					data.ballPosition.y = PADDLE_HEIGHT;
				} else {
					this.scoreData[index].scoreP2 += 1;
					this.OnPlayerWin(index);
					return;
				}
			} else if (data.ballPosition.y > (PONG_HEIGHT - BALL_HEIGHT - PADDLE_HEIGHT)) {
				const paddleSection = paddleCollision(paddles.paddle2Pos);
				if (paddleSection > 0) {
					bounceBall(paddleSection);
					data.ballPosition.y = PONG_HEIGHT - BALL_HEIGHT - PADDLE_HEIGHT;
				} else {
					this.scoreData[index].scoreP1 += 1;
					this.OnPlayerWin(index);
					return;
				}
			}
		}, this);

		this.ballRuntimeCustom.forEach((data, index) => {
			const paddles = this.paddleRuntime[index];

			function paddleCollision(paddlePos: number, paddleWidth: number) : number {
				if (data.ballPosition.x < (paddlePos - data.ballWidth) || (paddlePos + paddleWidth) < data.ballPosition.x)
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

				data.ballDelta.y = -data.ballDelta.y;
				data.ballDelta.x = angle;
			}

			function getRandomInt(min, max) {
				return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
			}

			if (data.ballPosition.y < PADDLE_HEIGHT / 2) {
				if (paddleCollision(paddles.paddle1Pos, paddles.paddleWidth)) {
					this.scoreData[index].scoreP2 += 1;
					this.OnPlayerWin(index);
				} else {
					bounceBall(getRandomInt(1, 6));
					data.ballPosition.y = PADDLE_HEIGHT;
					const ballWidth = Math.min(data.ballWidth + BALL_CUSTOM_GAIN, BALL_MAX_WIDTH);
					data.ballWidth = ballWidth;
					return;
				}
			} else if (data.ballPosition.y > (PONG_HEIGHT - BALL_HEIGHT - (PADDLE_HEIGHT / 2))) {
				if (paddleCollision(paddles.paddle2Pos, paddles.paddleWidth)) {
					this.scoreData[index].scoreP1 += 1;
					this.OnPlayerWin(index);
				} else {
					bounceBall(getRandomInt(1, 6));
					data.ballPosition.y = PONG_HEIGHT - BALL_HEIGHT - PADDLE_HEIGHT;
					const ballWidth = Math.min(data.ballWidth + BALL_CUSTOM_GAIN, BALL_MAX_WIDTH);
					data.ballWidth = ballWidth;
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
