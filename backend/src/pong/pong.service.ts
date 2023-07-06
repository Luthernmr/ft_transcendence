import { Injectable } from '@nestjs/common';
import { PongGateway } from './pong.gateway'
import { Socket } from 'socket.io';
import { HistoryService } from './history.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

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

enum FrontGameState {
	Playing,
	Finished
}

export interface PongInitData extends GameLayout, BallRuntimeData, PaddleRuntimeData, Score {
	playerNumber: number,
	gameState: FrontGameState,
	winner: number,
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
	scoreP1: 0,
	scoreP2: 0,
	playerNumber: 1,
	gameState: FrontGameState.Playing,
	winner: 0
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
	indexUser1: number,
	indexUser2: number
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

export interface UserInfos {
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
}

enum GameState {
	Connecting,
	Running,
	WaitingForRestart
}

type UserInfosIndex = number;

@Injectable()
export class PongService {
	pongGateway : PongGateway;

	userInfos: UserInfos[];
	lockedUsers: Array<UserInfosIndex>;

	clientReady: Array<boolean>; // userInfos Index
	requestRestart: Array<boolean>; // userInfos Index
	queueClassic: Array<number>; // userInfos Index
	queueCustom: Array<number>; // userInfos Index

	usersRuntime: Array<UserPair>;
	ballRuntime: Array<BallRuntimeData>;
	paddleRuntime: Array<PaddleRuntimeData>;

	ballRuntimeStandard: Array<BallRuntimeData>;
	ballRuntimeCustom: Array<BallRuntimeData>;
	paddleEvents: Set<number>;

	scoreData: Array<Score>;
	idPairs: Array<IDPair>;

	roomID: Array<number>;
	maxRoomID: number;

	customMode: Array<boolean>;
	gameState: Array<GameState>;
	
	constructor(private readonly historyService: HistoryService,
				private readonly userService: UserService,
				@InjectRepository(User)
				private userRepository: Repository<User>) {
					
		this.userInfos = [];
		this.lockedUsers = [];

		this.clientReady = []; // share same index as userInfos
		this.requestRestart = [];
		
		this.queueClassic = [];
		this.queueCustom = [];

		this.usersRuntime = [];
		this.ballRuntime = [];
		this.paddleRuntime = [];

		this.ballRuntimeCustom = [];
		this.ballRuntimeStandard = [];

		this.paddleEvents = new Set<number>();

		this.scoreData = [];
		this.idPairs = [];

		this.roomID = [];
		this.maxRoomID = -1;

		this.customMode = [];
		this.gameState = [];
	}

	RegisterGateway(pongGateway : PongGateway) {
		this.pongGateway = pongGateway;
	}

	RegisterUserInfos(userID: number, socket: Socket) {
		const userIndex = this.userInfos.findIndex(info => (info.userId === userID));

		if (userIndex >= 0 && this.userInfos[userIndex].socket == null)
		{
			this.userInfos[userIndex].socket = socket;

			// Game

			const roomIndex = this.FindIndexBySocketId(socket.id);

			if (roomIndex >= 0) {
				socket.join("room" + this.roomID[roomIndex]);
				const users = this.usersRuntime[roomIndex];
				if (socket.id === this.userInfos[users.indexUser1].socket.id)
					this.pongGateway.EmitOpponentReconnected(this.userInfos[users.indexUser2].socket);
				else
					this.pongGateway.EmitOpponentReconnected(this.userInfos[users.indexUser1].socket);
			}

		} else {
			this.userInfos.push({userId: userID, socket: socket});
			this.clientReady.push(false);
		}

		console.log("Added new user to pong userInfos (id: " + userID + ")");

		return;
	}

	UnregisterUserInfos(socket: Socket) {
		const index = this.userInfos.findIndex(infos => (infos.socket === socket));

		if (index < 0)
			return;

		// Queue
		this.LeaveQueue(index);

		// Running Game
		const roomIndex = this.FindIndexBySocketId(socket.id);

		if (roomIndex >= 0) {
			const users = this.usersRuntime[roomIndex];
			if (socket.id === this.userInfos[users.indexUser1].socket.id)
				this.pongGateway.EmitOpponentDisconnect(this.userInfos[users.indexUser2].socket);
			else
				this.pongGateway.EmitOpponentDisconnect(this.userInfos[users.indexUser1].socket);
		}

		// Socket
		this.userInfos[index].socket = null;

		//console.log('User unregistered from pong');
	}

	LaunchUpdates() {
		setInterval(this.GlobalUpdate.bind(this), 16);
	}

	GetSocket(userInfosIndex: number) : Socket {
		return this.userInfos[userInfosIndex].socket;
	}

	FindIndexBySocketId(socketID: string): number {
		return this.usersRuntime.findIndex(user => (this.GetSocket(user.indexUser1)?.id === socketID || this.GetSocket(user.indexUser2)?.id === socketID));
	}

	UserInQueue(userID: number) : { index: number, custom: boolean } {
		const classicIndex = this.queueClassic.findIndex(pend => (this.userInfos[pend].userId === userID));
		if (classicIndex >= 0)
			return({index: classicIndex, custom: false});

		const customIndex = this.queueCustom.findIndex(pend => (this.userInfos[pend].userId === userID));
		if (customIndex >= 0)
			return({index: customIndex, custom: true});

		return({index: -1, custom: false});
	}

	UserLocked(userIndex: UserInfosIndex) : boolean {
		return this.lockedUsers.findIndex(user => user === userIndex) >= 0;
	}

	JoinQueue(socket: Socket, custom: boolean = false) {
		const currentPlayerInfoIndex = this.userInfos.findIndex(infos => (infos.socket === socket));

		if (currentPlayerInfoIndex < 0) {
			console.log("User not registered to pong");
			return;
		}

		if (this.UserLocked(currentPlayerInfoIndex)) {
			console.log("user currently in game");
			return;
		}

		const queueInfos = this.UserInQueue(this.userInfos[currentPlayerInfoIndex].userId);
		if (queueInfos.index >= 0) {
			console.log("user already in queue");
			return;
		}

		const pendingPlayersArray = custom ? this.queueClassic : this.queueCustom;

		console.log("Joined queue, userID: " + this.userInfos[currentPlayerInfoIndex].userId);

		if (pendingPlayersArray.length >= 1) {
			this.lockedUsers.push(currentPlayerInfoIndex);
			const opponentInfoIndex = pendingPlayersArray[0];
			this.lockedUsers.push(opponentInfoIndex);
			pendingPlayersArray.splice(0, 1);
			this.CreateRoom(currentPlayerInfoIndex, opponentInfoIndex, custom);
		} else {
			console.log("Not enough players in queue");
			pendingPlayersArray.push(currentPlayerInfoIndex);
		}
	}

	LeaveQueueSocket(socket: Socket) {
		const userIndex = this.userInfos.findIndex(user => user.socket === socket);

		if (userIndex >= 0)
			this.LeaveQueue(userIndex);
	}

	LeaveQueue(userIndex: UserInfosIndex) {
		const queueInfos = this.UserInQueue(this.userInfos[userIndex].userId);

		if (queueInfos.index < 0)
			return;

		const queueArray = queueInfos.custom ? this.queueCustom : this.queueClassic;
		queueArray.splice(queueInfos.index, 1);
		console.log("User removed from the queue");
	}

	GetRuntimeIndex(userIndex: UserInfosIndex) : number {
		return this.usersRuntime.findIndex(users => (users.indexUser1 === userIndex || users.indexUser2 === userIndex));
	}

	AcceptInvitation(user1ID: number, user2ID: number, custom: boolean = false) : boolean {
		const user1Index = this.userInfos.findIndex(infos => (infos.userId === user1ID));
		const user2Index = this.userInfos.findIndex(infos => (infos.userId === user2ID));

		if (this.UserLocked(user1Index) || this.UserLocked(user2Index))
			return false;

		this.lockedUsers.push(user1Index);
		this.lockedUsers.push(user2Index);

		this.LeaveQueue(user1Index);
		this.LeaveQueue(user2Index);

		this.CreateRoom(user1Index, user2Index, custom);

		return true;
	}

	GetGameState(socket: Socket) : { pongState: PongState, payload: any } {
		const userInNormalQueue = this.queueClassic.findIndex(data => this.userInfos[data].socket === socket);
		const userInCustomQueue = this.queueCustom.findIndex(data => this.userInfos[data].socket === socket);

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
		if (this.GetSocket(this.usersRuntime[index].indexUser2) === socket)
			playerNumber = 1;

		const state: PongInitData = {
			width: PONG_WIDTH,
			height: PONG_HEIGHT,
			ballHeight: BALL_HEIGHT,
			paddleHeight: PADDLE_HEIGHT,
			...this.ballRuntime[index],
			...this.paddleRuntime[index],
			...this.scoreData[index],
			playerNumber: playerNumber,
			gameState: this.gameState[index] === GameState.WaitingForRestart ? FrontGameState.Finished : FrontGameState.Playing,
			winner: this.gameState[index] === GameState.WaitingForRestart ? ( this.scoreData[index].scoreP1 > this.scoreData[index].scoreP2 ? 1 : 2 ) : 0
		}

		return state;
	}

	async SetPlayingState(player1: UserInfosIndex, player2: UserInfosIndex, state: boolean) {
		const user1 = await this.userService.getUserById(this.userInfos[player1].userId);
		const user2 = await this.userService.getUserById(this.userInfos[player2].userId);

		await this.userRepository.update(user1.id, {
			isPlaying: state
		});

		await this.userRepository.update(user2.id, {
			isPlaying: state
		});
	}

	async CreateRoom(player1: UserInfosIndex, player2: UserInfosIndex, custom: boolean = false) {

		await this.SetPlayingState(player1, player2, true);

		const users: UserPair = {
			indexUser1: player1,
			indexUser2: player2,
		}
		
		this.usersRuntime.push(users);
		
		this.maxRoomID++;
		const roomIndex = this.maxRoomID;

		this.roomID.push(roomIndex);
		
		this.customMode.push(custom);
		
		const roomName = "room" + roomIndex;

		const playerInfo1 = this.userInfos[player1];
		const playerInfo2 = this.userInfos[player2];

		this.userInfos[player1].socket.join(roomName);
		this.userInfos[player2].socket.join(roomName);

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
		this.gameState.push(GameState.Connecting);

		console.log("room created");

		const initDatas = custom ? CUSTOM_INIT_DATAS : STANDARD_INIT_DATAS

		this.pongGateway.EmitInit(playerInfo1.socket, { ...initDatas, playerNumber: 2 });
		this.pongGateway.EmitInit(playerInfo2.socket, { ...initDatas, playerNumber: 1 });

		this.StartGameAtCountdown(this.usersRuntime.length - 1, COUNTDOWN);
	}

	RequestRestart(socket: Socket) {
		const instanceIndex = this.FindIndexBySocketId(socket.id);
		
		if (instanceIndex < 0) {
			console.log("ClientIsReady: client not found");
			return;
		}

		if (this.gameState[instanceIndex] != GameState.WaitingForRestart)
			return;

		const userPair = this.usersRuntime[instanceIndex];

		if (this.userInfos[userPair.indexUser1].socket === socket)
			this.requestRestart[userPair.indexUser1] = true;
		else
			this.requestRestart[userPair.indexUser2] = true;

		if (this.requestRestart[userPair.indexUser1] && this.requestRestart[userPair.indexUser2])
		{
			this.requestRestart[userPair.indexUser1] = false;
			this.requestRestart[userPair.indexUser2] = false;
			this.gameState[instanceIndex] = GameState.Running;

			const score: Score = {
				scoreP1: 0,
				scoreP2: 0
			}
	
			this.scoreData[instanceIndex] = score;
			this.pongGateway.EmitScore(this.roomID[instanceIndex], score);

			this.StartGameAtCountdown(instanceIndex, COUNTDOWN);
		}
	}

	ClientIsReady(socket: Socket) {
		const instanceIndex = this.FindIndexBySocketId(socket.id);
		
		if (instanceIndex < 0) {
			console.log("ClientIsReady: client not found");
			return;
		}

		if (this.gameState[instanceIndex] != GameState.Connecting)
			return;

		const userPair = this.usersRuntime[instanceIndex];

		if (this.userInfos[userPair.indexUser1].socket === socket)
			this.clientReady[userPair.indexUser1] = true;
		else
			this.clientReady[userPair.indexUser2] = true;

		if (this.clientReady[userPair.indexUser1] && this.clientReady[userPair.indexUser2]) {
			this.clientReady[userPair.indexUser1] = false;
			this.clientReady[userPair.indexUser2] = false;
			this.gameState[instanceIndex] = GameState.Running;

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
			//console.log('Joined room Id: ' + this.roomID[0]);
		} //else
			//console.log("No room is currently running!");
	}

	RemoveWatcher(index: number, socket: Socket) {
		socket.leave("room" + this.roomID[index]);
	}

	async StartGameAtCountdown(index: number, countdown: number) {				
		this.pongGateway.EmitStartGame(this.roomID[index], COUNTDOWN / 1000);

		await new Promise(r => setTimeout(r, countdown));
		this.ballRuntime[index].ballDelta = {x: BALL_START_DELTA_X, y: BALL_START_DELTA_Y};
		this.pongGateway.EmitBallDelta(this.roomID[index], this.ballRuntime[index]);
	}

	RestartGame(index: number) {
		this.ballRuntime[index].ballPosition = { ...BASE_INIT_DATAS.ballPosition };
		this.ballRuntime[index].ballDelta = {x: 0, y: 0};
		this.gameState[index] = GameState.Running;

		this.pongGateway.EmitBallDelta(this.roomID[index], this.ballRuntime[index]);
		
		this.StartGameAtCountdown(index, COUNTDOWN);
	}

	UserQuit(socket: Socket) : Socket {
		const usersIndex = this.FindIndexBySocketId(socket.id);

		let opponentSocket = null;
		if (this.GetSocket(this.usersRuntime[usersIndex].indexUser1) === socket)
			opponentSocket = this.GetSocket(this.usersRuntime[usersIndex].indexUser2);
		else
		opponentSocket = this.GetSocket(this.usersRuntime[usersIndex].indexUser1);

		this.CloseRoom(socket.id);
		console.log('user requested quit');
		return opponentSocket;
	}

	CloseRoom(socketID: string) {
		//console.log('Closing pong room');

		const index: number = this.FindIndexBySocketId(socketID);
		//console.log('Found index: ' + index);

		const player1Index = this.usersRuntime[index].indexUser1;
		const player2Index = this.usersRuntime[index].indexUser2;

		if (index >= 0) {
			this.CleanDatas(index);
			this.SetPlayingState(player1Index, player2Index, false);
			this.lockedUsers.splice(player1Index, 1);
			this.lockedUsers.splice(player2Index, 1);
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
		this.roomID.splice(index, 1);
		this.gameState.splice(index, 1);
		this.pongGateway.CloseRoom(this.roomID[index]);
	}

	PaddleKeyDown(socketID: string, input: number) {
		const instanceIndex = this.FindIndexBySocketId(socketID);
		if (instanceIndex < 0)
			return;
		
		const userPair = this.usersRuntime[instanceIndex];

		if (this.userInfos[userPair.indexUser1].socket.id === socketID) {
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

		if (this.userInfos[userPair.indexUser1].socket.id === socketID
			&& Math.sign(this.paddleRuntime[instanceIndex].paddle1Delta) === Math.sign(input)) {
			this.paddleRuntime[instanceIndex].paddle1Delta = 0;
		} else if (this.userInfos[userPair.indexUser2].socket.id === socketID
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
		this.gameState[index] = GameState.WaitingForRestart;

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

		const ballEvents: Set<number> = new Set<number>();

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
				ballEvents.add(index);
		}, this);

		// BALL EVENTS
		ballEvents.forEach(function(index) {
			this.pongGateway.EmitBallDelta(this.roomID[index], this.ballRuntime[index]);
		}, this);

		ballEvents.clear();
	}
}
