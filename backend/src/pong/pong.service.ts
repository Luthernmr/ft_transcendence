import { Injectable } from '@nestjs/common';
import { PongGateway } from './pong.gateway'
import { Socket } from 'socket.io';
import { HistoryService } from './history.service';
import { log } from 'console';
import { User } from 'src/user/user.entity';
import { IndexDescription } from 'typeorm';
import { cp } from 'fs';
import { queue } from 'rxjs';

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

// export interface PongInitData extends GameLayout {
// 	ballPosition: Vector2,
// 	paddlePos: number,
// 	countdown: number,
// 	score: Score,

// }

export interface PongInitData extends GameLayout, BallRuntimeData, PaddleRuntimeData, Score {
	countdown: number,
	playerNumber: number
}

const BASE_INIT_DATAS: PongInitData = {
	width: PONG_WIDTH,
	height: PONG_HEIGHT,
	ballHeight: BALL_HEIGHT,
	ballWidth: BALL_WIDTH,
	paddleHeight: PADDLE_HEIGHT,
	paddleWidth: PADDLE_WIDTH,
	ballPosition: {x: BALL_START_POS_X, y: BALL_START_POS_Y},
	ballDelta: {x: 0, y: 0},
	paddle1Pos: PADDLE_START_POS,
	paddle1Delta: 0,
	paddle2Pos: PADDLE_START_POS,
	paddle2Delta: 0,
	countdown: 0,
	scoreP1: 0,
	scoreP2: 0,
	playerNumber: 1
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

export interface UserPair {
	user1: number,
	user2: number
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

export interface WatcherInitDatas extends GameLayout, PongInitEntities, BallRuntimeData, PaddleRuntimeData, Score {}

export enum PongState {
	Home,
	Queue,
	Play,
	Finished,
	Watch,
	AlreadyConnected
}

export enum QueueState {
	Joined,
	AlreadyIn
}

type PlayerInfosIndex = number;

@Injectable()
export class PongService {
	playerInfos: PlayerInfos[];

	clientReady: Array<boolean>; // playerInfos Index
	pendingPlayers: Array<number>; // playerInfos Index
	pendingPlayersCustom: Array<number>; // playerInfos Index

	usersRuntime: Array<UserPair>;
	ballRuntime: Array<BallRuntimeData>;
	paddleRuntime: Array<PaddleRuntimeData>;

	ballRuntimeStandard: Array<BallRuntimeData>;
	ballRuntimeCustom: Array<BallRuntimeData>;

	ballEvents: Set<number>;
	paddleEvents: Set<number>;

	scoreData: Array<Score>;
	idPairs: Array<IDPair>;

	roomID: Array<number>;
	maxRoomID: number;

	customMode: Array<boolean>;

	pongGateway : PongGateway;

	gameActive: Array<boolean>;
	
	constructor(private readonly historyService: HistoryService) {
		this.playerInfos = [];
		this.clientReady = []; // share same index as playerInfos
		
		this.pendingPlayers = [];
		this.pendingPlayersCustom = [];

		this.usersRuntime = [];
		this.ballRuntime = [];
		this.paddleRuntime = [];

		this.ballRuntimeCustom = [];
		this.ballRuntimeStandard = [];

		this.ballEvents = new Set<number>();
		this.paddleEvents = new Set<number>();

		this.scoreData = [];
		this.idPairs = [];

		this.roomID = [];
		this.maxRoomID = -1;

		this.customMode = [];

		this.gameActive = [];
	}

	RegisterGateway(pongGateway : PongGateway) {
		this.pongGateway = pongGateway;
	}

	RegisterUserInfos(userID: number, socket: Socket) : boolean {
		//const playerInfosIndex = this.playerInfos.findIndex(infos => (infos.userId === userID));

		// if (playerInfosIndex >= 0) {
		// 	if (this.playerInfos[playerInfosIndex].socket === null) {
		// 		this.playerInfos[playerInfosIndex].socket = socket;
		// 		const instanceIndex = this.usersRuntime.findIndex(user => user.user1 === playerInfosIndex || user.user2 === playerInfosIndex);
		// 		if (instanceIndex >= 0)
		// 			socket.join('room' + this.roomID[instanceIndex]);
		// 	} else {
		// 		console.log("user", userID, "already connected to a pong instance");
		// 		return false;
		// 	}

		// 	console.log("Replaced pong socket (id: " + userID + ")");
		// } else {
		const newInfos: PlayerInfos = {userId: userID, socket: socket};

		const cleanIndex = this.playerInfos.findIndex(info => (info.userId === undefined));
		if (cleanIndex >= 0) {
			this.playerInfos[cleanIndex] = newInfos;
			this.clientReady[cleanIndex] = false;
			console.log("RegisterUserInfos: found clean index at " + cleanIndex);
		} else {
			this.playerInfos.push({userId: userID, socket: socket});
			this.clientReady.push(false);
		}
		console.log("Added new user to pong playerInfos (id: " + userID + ")");
		//}

		return true;
	}

	GetOtherUserInfoIndex(excludeSocket: Socket, userID: number) {
		return this.playerInfos.findIndex(info => (info.userId === userID && info.socket != excludeSocket));
	}

	UnregisterUserInfos(socket: Socket) {
		const index = this.playerInfos.findIndex(infos => (infos.socket === socket));

		if (index >= 0) {
			const otherIndex = this.GetOtherUserInfoIndex(socket, this.playerInfos[index].userId);
			if (otherIndex >= 0)
			{
				this.playerInfos[index].socket = this.playerInfos[otherIndex].socket;
				this.playerInfos[otherIndex].userId = undefined;
			} else {
				const queueInfo = this.UserInQueue(this.playerInfos[index].userId);
				if (queueInfo.index >= 0) {
					const pendingPlayersArray = queueInfo.custom ? this.pendingPlayersCustom : this.pendingPlayers;
					pendingPlayersArray.splice(queueInfo.index, 1);
				}

				this.playerInfos[index].userId = undefined;
			}
			//this.playerInfos[index].socket = null;
			//console.log("User socket set to null");
		}
		// } else if (index >= 0) {
		// 	const pendingIndex: number = this.pendingPlayers.findIndex(data => this.playerInfos[data].socket === socket);
		// 	if (pendingIndex >= 0)
		// 		this.pendingPlayers.splice(pendingIndex, 1);
	
		// 	const pendingCustomIndex: number = this.pendingPlayersCustom.findIndex(data => this.playerInfos[data].socket === socket);
		// 	if (pendingIndex >= 0)
		// 		this.pendingPlayersCustom.splice(pendingCustomIndex, 1);

		// 	this.playerInfos.splice(index, 1);
		// 	this.clientReady.splice(index, 1);
		// 	console.log("User unregistered from pong");
		// }
	}

	LaunchUpdates() {
		setInterval(this.GlobalUpdate.bind(this), 16);
	}

	GetSocket(userInfosIndex: number) : Socket {
		return this.playerInfos[userInfosIndex].socket;
	}

	FindIndexBySocketId(socketID: string): number {
		return this.usersRuntime.findIndex(user => (this.GetSocket(user.user1).id === socketID || this.GetSocket(user.user2).id === socketID));
	}

	UserInQueue(userID: number) : { index: number, custom: boolean } {
		const classicIndex = this.pendingPlayers.findIndex(pend => (this.playerInfos[pend].userId === userID));
		if (classicIndex >= 0)
			return({index: classicIndex, custom: false});

		const customIndex = this.pendingPlayersCustom.findIndex(pend => (this.playerInfos[pend].userId === userID));
		if (customIndex >= 0)
			return({index: customIndex, custom: true});

		return({index: -1, custom: false});
	}

	JoinQueue(socket: Socket, custom: boolean = false) {
		const currentPlayerInfoIndex = this.playerInfos.findIndex(infos => (infos.socket === socket));

		if (currentPlayerInfoIndex < 0) {
			console.log("user not registered to pong");
			return;
		}

		const queueInfos = this.UserInQueue(this.playerInfos[currentPlayerInfoIndex].userId);
		if (queueInfos.index >= 0) {
			console.log("user already in queue");
			if (this.playerInfos[queueInfos.index].socket != socket) {
				this.pongGateway.EmitQueueState(socket, { queueState: QueueState.AlreadyIn });
			} else
				this.pongGateway.EmitQueueState(socket, { queueState: QueueState.Joined });

			return;
		}

		const pendingPlayersArray = custom ? this.pendingPlayersCustom : this.pendingPlayers;

		console.log("Joined queue, userID: " + this.playerInfos[currentPlayerInfoIndex].userId);

		if (pendingPlayersArray.length >= 1 && this.playerInfos[pendingPlayersArray[0]].userId != null) {
			const opponentInfoIndex = pendingPlayersArray[0];
			pendingPlayersArray.splice(0, 1);
			this.CreateRoom(currentPlayerInfoIndex, opponentInfoIndex, custom);
		} else {
			console.log("not enough players in queue =", pendingPlayersArray.length)
			pendingPlayersArray.push(currentPlayerInfoIndex);
			this.pongGateway.EmitQueueState(socket, { queueState: QueueState.Joined });
		}
	}

	CheckForMatch() {
		if (this.pendingPlayers.length >= 2) {
			const user1InfoIndex = this.pendingPlayers[0];
			const user2InfoIndex = this.pendingPlayers[1];
			this.pendingPlayers.splice(0, 2);
			this.CreateRoom(user1InfoIndex, user2InfoIndex, false);
		}

		if (this.pendingPlayersCustom.length >= 2) {
			const user1InfoIndex = this.pendingPlayersCustom[0];
			const user2InfoIndex = this.pendingPlayersCustom[1];
			this.pendingPlayers.splice(0, 2);
			this.CreateRoom(user1InfoIndex, user2InfoIndex, true);
		}
	}

	AcceptInvitation(user1ID: number, user2ID: number, custom: boolean = false) {
		const user1Index = this.playerInfos.findIndex(infos => (infos.userId === user1ID));
		const user2Index = this.playerInfos.findIndex(infos => (infos.userId === user2ID));
		
		if (user1Index < 0 || user2Index < 0) {
			console.log("Error for users ", user1ID, " & ", user2ID, ", indexes = ", user1Index, " & ", user2Index);
			return;
		}

		this.CreateRoom(user1Index, user2Index, custom);
	}

	GetGameState(socket: Socket) : { pongState: PongState, payload: any } {
		const userInNormalQueue = this.pendingPlayers.findIndex(data => this.playerInfos[data].socket === socket);
		const userInCustomQueue = this.pendingPlayers.findIndex(data => this.playerInfos[data].socket === socket);

		if (userInNormalQueue >= 0)
			return { 	pongState: PongState.Queue,
						payload: 0 };
		else if (userInCustomQueue >= 0)
			return { 	pongState: PongState.Queue,
						payload: 1 };

		const userInGame = this.FindIndexBySocketId(socket.id);

		if (userInGame >= 0)
			return { 	pongState: PongState.Play,
						payload: this.GetCurrentGameDatas(socket, userInGame) };

		return { 	pongState: PongState.Home,
					payload: null };
	}

	GetCurrentGameDatas(socket: Socket, index: number) : PongInitData {
		let playerNumber = 2;
		if (this.GetSocket(this.usersRuntime[index].user2) === socket)
			playerNumber = 1;

		const state: PongInitData = {
			width: PONG_WIDTH,
			height: PONG_HEIGHT,
			ballHeight: BALL_HEIGHT,
			paddleHeight: PADDLE_HEIGHT,
			...this.ballRuntime[index],
			...this.paddleRuntime[index],
			...this.scoreData[index],
			countdown: 0,
			playerNumber: playerNumber
		}

		return state;
	}

	CreateRoom(player1: PlayerInfosIndex, player2: PlayerInfosIndex, custom: boolean = false) {

		this.maxRoomID++;
		const roomIndex = this.maxRoomID;

		this.roomID.push(roomIndex);
		
		this.customMode.push(custom);
		
		const users: UserPair = {
			user1: player1,
			user2: player2,
		}

		this.usersRuntime.push(users);

		const roomName = "room" + roomIndex;

		const playerInfo1 = this.playerInfos[player1];
		const playerInfo2 = this.playerInfos[player2];

		this.playerInfos[player1].socket.join(roomName);
		this.playerInfos[player2].socket.join(roomName);

		const ids: IDPair = {
			idP1: playerInfo1.userId,
			idP2: playerInfo2.userId
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
		this.gameActive.push(false);

		console.log("room created");

		const initDatas = custom ? CUSTOM_INIT_DATAS : STANDARD_INIT_DATAS

		this.pongGateway.EmitInit(playerInfo1.socket, { ...initDatas, playerNumber: 2 });
		this.pongGateway.EmitInit(playerInfo2.socket, { ...initDatas, playerNumber: 1 });

		this.StartGameAtCountdown(this.usersRuntime.length - 1, COUNTDOWN);
	}

	ClientsIsReady(socket: Socket) {
		const instanceIndex = this.FindIndexBySocketId(socket.id);
		
		if (instanceIndex < 0) {
			console.log("ClientIsReady: client not found");
			return;
		}

		if (this.gameActive[instanceIndex] == true)
			return;

		const userPair = this.usersRuntime[instanceIndex];

		if (this.playerInfos[userPair.user1].socket === socket)
			this.clientReady[userPair.user1] = true;
		else
			this.clientReady[userPair.user2] = true;

		if (this.clientReady[userPair.user1] && this.clientReady[userPair.user2])
		{
			this.clientReady[userPair.user1] = false;
			this.clientReady[userPair.user2] = false;
			const score: Score = {
				scoreP1: 0,
				scoreP2: 0
			}
	
			this.scoreData[instanceIndex] = score;
			this.pongGateway.EmitScore(this.roomID[instanceIndex], score);

			this.StartGameAtCountdown(instanceIndex, COUNTDOWN);
		}
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

	SendEachOtherUsersStart(index: number) {
		const users = this.usersRuntime[index];
		const player1Info = this.playerInfos[users.user1];
		const player2Info = this.playerInfos[users.user2];
		
		const otherUsers1 = this.playerInfos.filter(info => (info.userId === player1Info.userId && info.socket != player1Info.socket));
		const otherUsers2 = this.playerInfos.filter(info => (info.userId === player2Info.userId && info.socket != player2Info.socket));

		otherUsers1.forEach((user) => {
			this.pongGateway.EmitStartGameSecondary(user.socket);
		}, this);

		otherUsers2.forEach((user) => {
			this.pongGateway.EmitStartGameSecondary(user.socket);
		}, this);
	}

	async StartGameAtCountdown(index: number, countdown: number) {				
		this.pongGateway.EmitStartGame(this.roomID[index], COUNTDOWN / 1000);
		this.SendEachOtherUsersStart(index);

		await new Promise(r => setTimeout(r, countdown));
		this.ballRuntime[index].ballDelta = {x: BALL_START_DELTA_X, y: BALL_START_DELTA_Y};
		this.pongGateway.EmitBallDelta(this.roomID[index], this.ballRuntime[index]);
	}

	RestartGame(index: number) {
		this.ballRuntime[index].ballPosition = { ...BASE_INIT_DATAS.ballPosition };
		this.ballRuntime[index].ballDelta = {x: 0, y: 0};
		this.gameActive[index] = true;

		this.pongGateway.EmitBallDelta(this.roomID[index], this.ballRuntime[index]);
		
		this.StartGameAtCountdown(index, COUNTDOWN);
	}

	UserQuit(socket: Socket) {
		this.CloseRoom(socket.id);
		console.log('user requested quit');
	}

	CloseRoom(socketID: string) {
		console.log("Closing pong room");

		const index: number = this.FindIndexBySocketId(socketID);
		console.log("Found index: " + index);
		
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
		this.usersRuntime.splice(index, 1);
		this.ballRuntime.splice(index, 1);
		this.paddleRuntime.splice(index, 1);
		this.scoreData.splice(index, 1);
		this.idPairs.splice(index, 1);
		this.pongGateway.CloseRoom(this.roomID[index]);
		this.roomID.splice(index, 1);
	}

	PaddleKeyDown(socketID: string, input: number) {
		const instanceIndex = this.FindIndexBySocketId(socketID);
		if (instanceIndex < 0)
			return;
		
		const userPair = this.usersRuntime[instanceIndex];

		if (this.playerInfos[userPair.user1].socket.id === socketID) {
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

		const userPair = this.usersRuntime[instanceIndex];

		if (this.playerInfos[userPair.user1].socket.id === socketID
			&& Math.sign(this.paddleRuntime[instanceIndex].paddle1Delta) === Math.sign(input)) {
			this.paddleRuntime[instanceIndex].paddle1Delta = 0;
		} else if (this.playerInfos[userPair.user2].socket.id === socketID
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
		this.gameActive[index] = false;

		this.pongGateway.EmitBallDelta(this.roomID[index], this.ballRuntime[index]);
		this.pongGateway.EmitEnd(this.roomID[index], winner);

		this.historyService.addEntry(this.idPairs[index], this.scoreData[index]);
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
