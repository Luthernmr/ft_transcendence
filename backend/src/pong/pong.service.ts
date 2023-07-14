import { Injectable } from '@nestjs/common';
import { PongGateway } from './pong.gateway'
import { Socket } from 'socket.io';
import { HistoryService } from './history.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { debug } from 'console';
import { watch } from 'fs';

const COUNTDOWN: number = 3000;

const FRAMERATE: number = 16;

const PONG_WIDTH: number = 450;
const PONG_HEIGHT: number = 600;

const BALL_HEIGHT: number = 20;
const BALL_WIDTH: number = BALL_HEIGHT;
const BALL_WIDTH_CUSTOM: number = 50;
const BALL_CUSTOM_GAIN: number = 8;
const BALL_MAX_WIDTH: number = 200;

const BALL_START_POS_X: number = PONG_WIDTH / 2 - BALL_WIDTH / 2;
const BALL_START_POS_X_CUSTOM: number = PONG_WIDTH / 2 - BALL_WIDTH_CUSTOM / 2;
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
const PADDLE_START_POS: number = PONG_WIDTH / 2 - PADDLE_WIDTH / 2;
const PADDLE_START_POS_CUSTOM : number = PONG_WIDTH / 2 - PADDLE_WIDTH_CUSTOM / 2;

const PADDLE_SPEED: number = 40;

const WIN_SCORE: number = 3;

export interface GameDatas 
{
	pongState: PongState,
	payload: any
}

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

export interface UserDatas {
	id: number,
	nickname: string,
	imgPdp: string,
	level: number
}

export interface PongInitData extends GameLayout, Score {
	playerNumber: number,
	gameState: FrontGameState,
	winner: number,
	user1Datas: UserDatas,
	user2Datas: UserDatas,
	watchers: Array<UserDatas>
}

const BASE_USER_DATAS: UserDatas = {
	id: -1,
	nickname: "",
	imgPdp: "",
	level: 0
}

const BASE_INIT_DATAS: PongInitData = {
	width: PONG_WIDTH,
	height: PONG_HEIGHT,
	ballHeight: BALL_HEIGHT,
	paddleHeight: PADDLE_HEIGHT,
	scoreP1: 0,
	scoreP2: 0,
	user1Datas: BASE_USER_DATAS,
	user2Datas: BASE_USER_DATAS,
	playerNumber: 1,
	gameState: FrontGameState.Playing,
	winner: 0,
	watchers: []
}

export interface PongInitEntities extends BallRuntimeData, PaddleRuntimeData {

}

const STANDARD_ENTITIES: PongInitEntities = {
	ballWidth: BALL_WIDTH,
	ballPosition: {x: BALL_START_POS_X, y: BALL_START_POS_Y},
	ballDelta: {x: 0, y: 0},
	paddleWidth: PADDLE_WIDTH,
	paddle1Delta: 0,
	paddle1Pos: PADDLE_START_POS,
	paddle2Delta: 0,
	paddle2Pos: PADDLE_START_POS
}

const CUSTOM_ENTITIES: PongInitEntities = {
	ballWidth: BALL_WIDTH_CUSTOM,
	ballPosition: {x: BALL_START_POS_X_CUSTOM, y: BALL_START_POS_Y},
	ballDelta: {x: 0, y: 0},
	paddleWidth: PADDLE_WIDTH_CUSTOM,
	paddle1Delta: 0,
	paddle1Pos: PADDLE_START_POS_CUSTOM,
	paddle2Delta: 0,
	paddle2Pos: PADDLE_START_POS_CUSTOM
}

const STANDARD_INIT_DATAS = { ...BASE_INIT_DATAS, ...STANDARD_ENTITIES };
const CUSTOM_INIT_DATAS = { ...BASE_INIT_DATAS, ...CUSTOM_ENTITIES }

export interface UserPair {
	indexUser1: number,
	indexUser2: number,
	user1Datas: UserDatas,
	user2Datas: UserDatas
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

export interface WatcherInitDatas extends PongInitData, PongInitEntities {}

export enum PongState {
	Load,
	Home,
	Play,
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
	watchers: Array<number>; //userInfos Index, contains roomIDs
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
	awaitGameState: Array<Socket>;

	time: number;
	
	constructor(private readonly historyService: HistoryService,
				private readonly userService: UserService,
				@InjectRepository(User)
				private userRepository: Repository<User>) {
					
		this.userInfos = [];
		this.lockedUsers = [];
		this.watchers = [];

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
		this.awaitGameState = [];

		this.time = Date.now();
	}

	RegisterGateway(pongGateway : PongGateway) {
		this.pongGateway = pongGateway;
	}

	RegisterUserInfos(userID: number, socket: Socket) {
		const userIndex = this.userInfos.findIndex(
			(info) => info.userId === userID,
		);

		if (userIndex >= 0 && this.userInfos[userIndex].socket == null) {
			this.userInfos[userIndex].socket = socket;
			
			// Game

			//const roomIndex = this.FindIndexBySocketId(socket.id);
			const roomID = this.GetRoomIDBySocketID(socket.id);

			if (roomID >= 0) {
				socket.join("room" + roomID);
				const runtimeIndex = this.GetRuntimeIndexByRoomID(roomID);
				const users = this.usersRuntime[runtimeIndex];
				if (socket.id === this.GetSocket(users.indexUser1)?.id && this.GetSocket(users.indexUser2))
					this.pongGateway.EmitOpponentReconnected(this.userInfos[users.indexUser2].socket);
				else if (this.GetSocket(users.indexUser1))
					this.pongGateway.EmitOpponentReconnected(this.userInfos[users.indexUser1].socket);
			}

		} else {
			this.userInfos.push({userId: userID, socket: socket});
			this.clientReady.push(false);
		}

		//console.log("Added new user to pong userInfos (id: " + userID + ")");

		const awaitGSIndex = this.awaitGameState.findIndex(s => s === socket);
		if (awaitGSIndex >= 0)
		{
			this.awaitGameState.splice(awaitGSIndex, 1);
			this.SendGameState(socket);
		}

		return;
	}

	UnregisterUserInfos(socket: Socket) {
		const userInfoIndex = this.userInfos.findIndex(infos => (infos.socket?.id === socket.id));

		if (userInfoIndex < 0) {
			//console.log("Cannot find index for socket", socket.id);
			return;
		}

		// Queue
		this.LeaveQueue(userInfoIndex);

		// Watcher
		const watchRoomID = this.watchers[userInfoIndex];
		if (watchRoomID >= 0)
			this.RemoveWatcher(watchRoomID, userInfoIndex);
		this.watchers[userInfoIndex] = -1;

		// Running Game
		//const roomIndex = this.FindIndexBySocketId(socket.id);
		const roomID = this.GetRoomIDBySocketID(socket.id);

		if (roomID >= 0) {
			const runtimeIndex = this.GetRuntimeIndexByRoomID(roomID);
			const users = this.usersRuntime[runtimeIndex];
			if (socket.id === this.GetSocket(users.indexUser1)?.id && this.GetSocket(users.indexUser2))
			this.pongGateway.EmitOpponentDisconnect(this.userInfos[users.indexUser2].socket);
				else if (this.GetSocket(users.indexUser1))
			this.pongGateway.EmitOpponentDisconnect(this.userInfos[users.indexUser1].socket);
		}

		// Socket
		//console.log("Setting userInfo socket to null (user", this.userInfos[index].userId, ")");
		this.userInfos[userInfoIndex].socket = null;

		//console.log('User unregistered from pong');
	}

	LaunchUpdates() {
		setInterval(this.GlobalUpdate.bind(this), FRAMERATE);
	}

	GetSocket(userInfosIndex: number) : Socket {
		return this.userInfos[userInfosIndex].socket;
	}

	FindIndexBySocketId(socketID: string): number {
		return this.usersRuntime.findIndex(user => (this.GetSocket(user.indexUser1)?.id === socketID || this.GetSocket(user.indexUser2)?.id === socketID));
	}

	GetRoomIDBySocketID(socketID: string): number {
		const runtimeIndex = this.usersRuntime.findIndex(user => (this.GetSocket(user.indexUser1)?.id === socketID || this.GetSocket(user.indexUser2)?.id === socketID));
		if (runtimeIndex < 0)
			return -1;
		
		return this.roomID[runtimeIndex];
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
      //console.log("User not registered to pong");
      		return;
    	}

		if (this.UserLocked(currentPlayerInfoIndex)) {
			//console.log("user currently in game");
			return;
		}

		if (this.watchers[currentPlayerInfoIndex] >= 0) {
			console.log("user ", this.userInfos[currentPlayerInfoIndex].userId, ": cannot join queue when you're watching a game !");
		}

		const queueInfos = this.UserInQueue(this.userInfos[currentPlayerInfoIndex].userId);
		if (queueInfos.index >= 0) {
			if (queueInfos.custom === custom) {
				console.log("user already in queue");
				return;
			} else {
				this.LeaveQueue(currentPlayerInfoIndex);
			}
		}

		const pendingPlayersArray = custom ? this.queueCustom : this.queueClassic;

		console.log("Joined queue, userID: " + this.userInfos[currentPlayerInfoIndex].userId);

		if (pendingPlayersArray.length >= 1) {
			const opponentInfoIndex = pendingPlayersArray[0];
			this.lockedUsers.push(currentPlayerInfoIndex);
			this.lockedUsers.push(opponentInfoIndex);
			pendingPlayersArray.splice(0, 1);
			this.CreateRoom(currentPlayerInfoIndex, opponentInfoIndex, custom);
		} else {
			//console.log("Not enough players in queue");
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

	// GetRuntimeIndex(userIndex: UserInfosIndex) : number {
	// 	return this.usersRuntime.findIndex(users => (users.indexUser1 === userIndex || users.indexUser2 === userIndex));
	// }

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

	RequestGameState(socket: Socket) {
		const userIndex = this.userInfos.findIndex(user => user.socket === socket);

		if (userIndex < 0) {
			this.awaitGameState.push(socket);
		} else {
			//console.log("Found user", this.userInfos[userIndex].userId, ", sending it to socket", socket.id);
			this.SendGameState(socket);
		}
	}

	async SendGameState(socket: Socket) {
		const gameState = await this.GetGameState(socket);
		this.pongGateway.EmitGameState(socket, gameState);
	}

	async GetGameState(socket: Socket) : Promise<GameDatas> {
		//const userInGame = this.FindIndexBySocketId(socket.id);
		const userRoomID = this.GetRoomIDBySocketID(socket.id);

		if (userRoomID >= 0) {
			return { 	pongState: PongState.Play,
						payload: await this.GetCurrentGameDatas(socket, userRoomID) };
		}

		const userIndex = this.userInfos.findIndex(data => data.socket === socket);

		const watcherRoomID = this.watchers[userIndex];
		if (watcherRoomID >= 0) {
			return { 	pongState: PongState.Watch,
						payload: await this.GetCurrentGameDatas(socket, watcherRoomID) };
		}

		const queueInfos = this.UserInQueue(this.userInfos[userIndex].userId);
				
		return { 	pongState: PongState.Home,
					payload: {
						pongQueue: queueInfos.index >= 0 ? queueInfos.custom === false : false,
						gnopQueue: queueInfos.index >= 0 ? queueInfos.custom === true : false
					} };
	}

	async GetCurrentGameDatas(socket: Socket, roomID: number) : Promise<PongInitData> {
		const index = this.GetRuntimeIndexByRoomID(roomID);

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
			winner: this.gameState[index] === GameState.WaitingForRestart ? ( this.scoreData[index].scoreP1 > this.scoreData[index].scoreP2 ? 1 : 2 ) : 0,
			user1Datas: this.usersRuntime[index].user1Datas,
			user2Datas: this.usersRuntime[index].user2Datas,
			watchers: await this.GetWatchersDatas(roomID)
		}

		return state;
	}

	GetRuntimeIndexByRoomID(roomID: number) : number {
		return this.roomID.findIndex(id => id === roomID)
	}
	
	async GetWatchersDatas(roomID: number) : Promise<Array<UserDatas>> {
		const watchersList : Array<UserDatas> = [];

		for (let i = 0; i < this.watchers.length; i++) {
			if (this.watchers[i] === roomID) {
				const user = await this.userService.getUserById(this.userInfos[i].userId);
				watchersList.push(user);
			}
		}

		return watchersList;
	}

	async SetPlayingState(player1: UserInfosIndex, player2: UserInfosIndex, state: boolean) : Promise<{user1: User, user2: User}> {
		const user1 = await this.userService.getUserById(this.userInfos[player1].userId);
		const user2 = await this.userService.getUserById(this.userInfos[player2].userId);

		await this.userRepository.update(user1.id, {
			isPlaying: state
		});

		await this.userRepository.update(user2.id, {
			isPlaying: state
		});

		return {user1: user1, user2: user2};
	}

	async CreateRoom(player1: UserInfosIndex, player2: UserInfosIndex, custom: boolean = false) {

		await this.SetPlayingState(player1, player2, true);
		this.pongGateway.ReloadList()
		const {user1, user2} = await this.SetPlayingState(player1, player2, true);

		const users: UserPair = {
			indexUser1: player1,
			indexUser2: player2,
			user1Datas:  {
				id: user1.id,
				nickname: user1.nickname,
				imgPdp: user1.imgPdp,
				level: user1.level
			},
			user2Datas: {
				id: user2.id,
				nickname: user2.nickname,
				imgPdp: user2.imgPdp,
				level: user2.level
			},
		}
		
		this.usersRuntime.push(users);
		
		this.maxRoomID++;
		const roomID = this.maxRoomID;

		this.roomID.push(roomID);
		
		this.customMode.push(custom);
		
		const roomName = "room" + roomID;

		const playerInfo1 = this.userInfos[player1];
		const playerInfo2 = this.userInfos[player2];

		this.userInfos[player1].socket.join(roomName);
		this.userInfos[player2].socket.join(roomName);

		const ids: IDPair = {
			idP1: playerInfo1.userId,
			idP2: playerInfo2.userId,
		};

		this.idPairs.push(ids);

		const initDatas = custom ? CUSTOM_INIT_DATAS : STANDARD_INIT_DATAS;

		initDatas.user1Datas = users.user1Datas;
		initDatas.user2Datas = users.user2Datas;

		const ball: BallRuntimeData = {
			ballPosition: { ...initDatas.ballPosition },
			ballWidth: initDatas.ballWidth,
			ballDelta: { ...initDatas.ballDelta },
		};

		this.ballRuntime.push(ball);

		custom
		? this.ballRuntimeCustom.push(ball)
		: this.ballRuntimeStandard.push(ball);

		const paddles: PaddleRuntimeData = {
			paddleWidth: initDatas.paddleWidth,
			paddle1Pos: initDatas.paddle1Pos,
			paddle1Delta: 0,
			paddle2Pos: initDatas.paddle2Pos,
			paddle2Delta: 0
		}

		this.paddleRuntime.push(paddles);

		const score: Score = {
		scoreP1: 0,
		scoreP2: 0,
		};

		this.scoreData.push(score);
		this.gameState.push(GameState.Connecting);

		//console.log("room created");

		this.pongGateway.EmitInit(playerInfo1.socket, { ...initDatas, playerNumber: 2 });
		this.pongGateway.EmitInit(playerInfo2.socket, { ...initDatas, playerNumber: 1 });

		//console.log("CreateRoom requested StartGameAtCountdown for roomID " + roomID);
		//this.StartGameAtCountdown(roomID, COUNTDOWN);
  	}

	RequestRestart(socket: Socket) {
		//const instanceIndex = this.FindIndexBySocketId(socket.id);
		const roomID = this.GetRoomIDBySocketID(socket.id);

		if (roomID < 0) {
      	//console.log("ClientIsReady: client not found");
      		return;
   		}

		const runtimeIndex = this.GetRuntimeIndexByRoomID(roomID);

		if (this.gameState[runtimeIndex] != GameState.WaitingForRestart)
			return;

		const userPair = this.usersRuntime[runtimeIndex];

		if (this.userInfos[userPair.indexUser1].socket === socket)
			this.requestRestart[userPair.indexUser1] = true;
		else
			this.requestRestart[userPair.indexUser2] = true;

		if (this.requestRestart[userPair.indexUser1] && this.requestRestart[userPair.indexUser2])
		{
			this.requestRestart[userPair.indexUser1] = false;
			this.requestRestart[userPair.indexUser2] = false;
			this.gameState[runtimeIndex] = GameState.Running;

			const score: Score = {
				scoreP1: 0,
				scoreP2: 0
			}
	
			this.scoreData[runtimeIndex] = score;

			this.pongGateway.EmitScore(roomID, score);

			console.log("RequestRestart requested StartGameAtCountdown for roomID " + roomID);
			this.StartGameAtCountdown(roomID, COUNTDOWN);
		}
	}

	ClientIsReady(socket: Socket) {
		//const instanceIndex = this.FindIndexBySocketId(socket.id);
		const roomID = this.GetRoomIDBySocketID(socket.id);

		if (roomID < 0) {
      		//console.log("ClientIsReady: client not found");
      		return;
    	}

		const runtimeIndex = this.GetRuntimeIndexByRoomID(roomID);

		if (this.gameState[runtimeIndex] != GameState.Connecting)
			return;

		const userPair = this.usersRuntime[runtimeIndex];

		if (this.userInfos[userPair.indexUser1].socket === socket)
			this.clientReady[userPair.indexUser1] = true;
		else
			this.clientReady[userPair.indexUser2] = true;

		if (this.clientReady[userPair.indexUser1] && this.clientReady[userPair.indexUser2]) {
			this.clientReady[userPair.indexUser1] = false;
			this.clientReady[userPair.indexUser2] = false;
			this.gameState[runtimeIndex] = GameState.Running;

			console.log("ClientIsReady requested StartGameAtCountdown for roomID " + roomID);
			this.StartGameAtCountdown(roomID, COUNTDOWN);
		}
	}

	WatchRandom(socket: Socket) {
		const watcherInfoIndex = this.userInfos.findIndex(info => info.socket === socket);

		if (watcherInfoIndex < 0) {
			console.log("Watcher not registered to pong");
			return;
		}

		this.AddWatcherByUser(this.userInfos[watcherInfoIndex].userId, this.userInfos[this.usersRuntime[0].indexUser1].userId);
	}

	AddWatcherByUser(userWatcherID: number, userPlayerID: number) {
		const watcherUserInfosIndex = this.userInfos.findIndex(info => info.userId === userWatcherID);

		if (this.watchers[watcherUserInfosIndex] >= 0) {
			console.log("AddWatcher: cannot watch game when already watching one !");
			return;
		}

		const watcherRuntimeIndex = this.usersRuntime.findIndex(pair => pair.indexUser1 === watcherUserInfosIndex
																|| pair.indexUser2 === watcherUserInfosIndex);

		if (watcherRuntimeIndex >= 0) {
			console.log("AddWatcher: cannot watch a game when playing one !");
			return;
		}

		const playerUserInfosIndex = this.userInfos.findIndex(info => info.userId === userPlayerID);

		const playerRuntimeIndex = this.usersRuntime.findIndex(pair => pair.indexUser1 === playerUserInfosIndex
																|| pair.indexUser2 === playerUserInfosIndex)

		if (playerRuntimeIndex < 0) {
			console.log("AddWatcher: requested to user of id " + userPlayerID + " but target user is not playing");
			return;
		}

		const roomID = this.roomID[playerRuntimeIndex];

		this.AddWatcher(roomID, watcherUserInfosIndex);
	}

	async AddWatcher(roomID: number, watcherInfoIndex: UserInfosIndex) {
		if (roomID < 0)
			return;

		this.LeaveQueue(watcherInfoIndex);

		const user = await this.userService.getUserById(this.userInfos[watcherInfoIndex].userId);

		const socket = this.userInfos[watcherInfoIndex].socket;
		
		this.watchers[watcherInfoIndex] = roomID;

		this.pongGateway.EmitAddWatcher(roomID, user);

		socket.join('room' + roomID);

		const gameDatas = await this.GetCurrentGameDatas(socket, roomID);

		this.pongGateway.EmitGameState(socket, {pongState : PongState.Watch, payload : gameDatas});
	}


	RemoveWatcher(roomID: number, watcherInfoIndex: UserInfosIndex) {
		const socket = this.userInfos[watcherInfoIndex].socket;
		
		this.watchers[watcherInfoIndex] = -1;

		socket.leave("room" + roomID);

		this.pongGateway.EmitRemoveWatcher(roomID, this.userInfos[watcherInfoIndex].userId);

		this.SendGameState(socket);
	}

	RemoveWatcherBySocket(socket: Socket) {
		const watcherInfoIndex = this.userInfos.findIndex(info => info.socket === socket);
	
		const watcherRoomID = this.watchers[watcherInfoIndex];
		if (watcherRoomID < 0)
			return;
		
		this.RemoveWatcher(watcherRoomID, watcherInfoIndex);
	}


	StartGameAtCountdown(roomID: number, countdown: number) {				
		let runtimeIndex = this.GetRuntimeIndexByRoomID(roomID);
		if (runtimeIndex < 0)
			return;

		this.pongGateway.EmitStartGame(roomID, COUNTDOWN / 1000);

		setTimeout(() => this.StartGame(roomID), countdown);
	}

	StartGame(roomID: number) {
		let runtimeIndex = this.GetRuntimeIndexByRoomID(roomID);
		if (runtimeIndex < 0) {
			console.log("StartGameAtCountdown: runtimeIndex not found " + runtimeIndex);
			return;
		}

		this.ballRuntime[runtimeIndex].ballDelta = {x: BALL_START_DELTA_X, y: BALL_START_DELTA_Y};
		this.pongGateway.EmitBallDelta(roomID, this.ballRuntime[runtimeIndex]);
	}

	RestartGame(roomID: number) {
		const runtimeIndex = this.GetRuntimeIndexByRoomID(roomID);
		this.ballRuntime[runtimeIndex].ballPosition = { 
			x: PONG_WIDTH / 2 - this.ballRuntime[runtimeIndex].ballWidth / 2,
			y: BALL_START_POS_Y
		};
		this.ballRuntime[runtimeIndex].ballDelta = {x: 0, y: 0};
		this.gameState[runtimeIndex] = GameState.Running;

		this.pongGateway.EmitBallDelta(roomID, this.ballRuntime[runtimeIndex]);
		
		this.StartGameAtCountdown(roomID, COUNTDOWN);
	}

	UserQuit(socket: Socket) : Socket {
		const usersIndex = this.FindIndexBySocketId(socket.id);

		let opponentSocket = null;
		if (this.GetSocket(this.usersRuntime[usersIndex].indexUser1) === socket)
			opponentSocket = this.GetSocket(this.usersRuntime[usersIndex].indexUser2);
		else
			opponentSocket = this.GetSocket(this.usersRuntime[usersIndex].indexUser1);

		this.CloseRoom(socket.id);
		//console.log('user requested quit');
    	return opponentSocket;
  }

	CloseRoom(socketID: string) {
    //console.log('Closing pong room');

		const roomID = this.GetRoomIDBySocketID(socketID);
		const runtimeIndex = this.GetRuntimeIndexByRoomID(roomID);
		//console.log('Found index: ' + index);

		const player1Index = this.usersRuntime[runtimeIndex].indexUser1;
		const player2Index = this.usersRuntime[runtimeIndex].indexUser2;

		if (runtimeIndex >= 0) {
			this.CleanDatas(roomID);
			this.SetPlayingState(player1Index, player2Index, false);
			this.pongGateway.ReloadList()
			const lockedIndex1 = this.lockedUsers.findIndex(index => index === player1Index);
			this.lockedUsers.splice(lockedIndex1, 1);
			const lockedIndex2 = this.lockedUsers.findIndex(index => index === player2Index);
			this.lockedUsers.splice(lockedIndex2, 1);
			return;
		}
	}

	CleanDatas(roomID: number) {
		const runtimeIndex = this.GetRuntimeIndexByRoomID(roomID);

		const ballRuntimeMode = this.customMode[runtimeIndex] ? this.ballRuntimeCustom : this.ballRuntimeStandard;
		const modeIndex = ballRuntimeMode.indexOf(this.ballRuntime[runtimeIndex]);
		ballRuntimeMode.splice(modeIndex, 1);

		this.customMode.splice(runtimeIndex, 1);
		this.usersRuntime.splice(runtimeIndex, 1);
		this.ballRuntime.splice(runtimeIndex, 1);
		this.paddleRuntime.splice(runtimeIndex, 1);
		this.scoreData.splice(runtimeIndex, 1);
		this.idPairs.splice(runtimeIndex, 1);

		this.watchers.forEach((watchRoom, watcherIndex) => {
			if (watchRoom === roomID)
				this.RemoveWatcher(roomID, watcherIndex);
		}, this);

		this.roomID.splice(runtimeIndex, 1);
		this.gameState.splice(runtimeIndex, 1);
		this.pongGateway.CloseRoom(roomID);
	}

	PaddleKeyDown(socketID: string, input: number) {
		const roomID = this.GetRoomIDBySocketID(socketID);
		
		if (roomID < 0)
			return;

		const runtimeIndex = this.GetRuntimeIndexByRoomID(roomID);
		
		const userPair = this.usersRuntime[runtimeIndex];

		if (this.userInfos[userPair.indexUser1].socket.id === socketID) {
			this.paddleRuntime[runtimeIndex].paddle1Delta = input * PADDLE_SPEED;
		} else {
			this.paddleRuntime[runtimeIndex].paddle2Delta = input * PADDLE_SPEED;
		}

		this.paddleEvents.add(roomID);
	}

	PaddleKeyUp(socketID: string, input: number) {
		const roomID = this.GetRoomIDBySocketID(socketID);
		
		if (roomID < 0)
			return;

		const runtimeIndex = this.GetRuntimeIndexByRoomID(roomID);

		const userPair = this.usersRuntime[runtimeIndex];

		if (this.userInfos[userPair.indexUser1].socket.id === socketID
			&& Math.sign(this.paddleRuntime[runtimeIndex].paddle1Delta) === Math.sign(input)) {
			this.paddleRuntime[runtimeIndex].paddle1Delta = 0;
		} else if (this.userInfos[userPair.indexUser2].socket.id === socketID
			&& Math.sign(this.paddleRuntime[runtimeIndex].paddle2Delta) === Math.sign(input)) {
			this.paddleRuntime[runtimeIndex].paddle2Delta = 0;
		} else
			return;

		this.paddleEvents.add(roomID);
	}

	OnPlayerWin(roomID: number, winner: number) {
		const runtimeIndex = this.GetRuntimeIndexByRoomID(roomID);
		const scoreData = this.scoreData[runtimeIndex];

		if (winner === 1)
			scoreData.scoreP1 += 1;
		else
			scoreData.scoreP2 += 1;

		this.pongGateway.EmitScore(roomID, scoreData);
		if (scoreData.scoreP1 >= WIN_SCORE || scoreData.scoreP2 >= WIN_SCORE)
			this.EndGame(roomID);
		else
			this.RestartGame(roomID);
	}

	EndGame(roomID: number) {

		const runtimeIndex = this.GetRuntimeIndexByRoomID(roomID);

		const winner: number = (this.scoreData[runtimeIndex].scoreP1 > this.scoreData[runtimeIndex].scoreP2) ? 1 : 2;
		const custom = this.customMode[runtimeIndex];

		this.ballRuntime[runtimeIndex].ballPosition = { x: custom ? BALL_START_POS_X_CUSTOM : BALL_START_POS_X,
														y: BALL_START_POS_Y };
		this.ballRuntime[runtimeIndex].ballWidth = custom ? BALL_WIDTH_CUSTOM : BALL_WIDTH,
		this.ballRuntime[runtimeIndex].ballDelta = {x: 0, y: 0}

		this.gameState[runtimeIndex] = GameState.WaitingForRestart;

		this.pongGateway.EmitBallDelta(roomID, this.ballRuntime[runtimeIndex]);
		this.pongGateway.EmitEnd(roomID, winner);

		this.historyService.addEntry(this.idPairs[runtimeIndex], this.scoreData[runtimeIndex], custom);
	}

	GlobalUpdate() {
		const currentTime = Date.now();
		const deltaTime = currentTime - this.time;
		this.time = currentTime;
		const framerate = deltaTime / 100;

		// PADDLE CALCULATIONS
		this.paddleRuntime.forEach(function (data, index) {
			const oldPaddle1Delta = data.paddle1Delta;
			const oldPaddle2Delta = data.paddle2Delta;

			data.paddle1Pos += data.paddle1Delta * framerate;
			data.paddle2Pos += data.paddle2Delta * framerate;

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
				this.paddleEvents.add(this.roomID[index]);
		}, this);

		// PADDLE EVENTS
		this.paddleEvents.forEach(function(roomID) {
			const runtimeIndex = this.GetRuntimeIndexByRoomID(roomID);
			this.pongGateway.EmitPaddleDelta(roomID, this.paddleRuntime[runtimeIndex]);
		}, this);

		this.paddleEvents.clear();

		const oldBallDelta = this.ballRuntime.map(data => ({
			...data.ballDelta,
		}));

		// BALL CALCULATIONS
		this.ballRuntime.forEach(function (data) {
			data.ballPosition.x += data.ballDelta.x * framerate;
			data.ballPosition.y += data.ballDelta.y * framerate;

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
					const runtimeIndex = this.ballRuntime.indexOf(data);
					this.OnPlayerWin(this.roomID[runtimeIndex], 2);
					return;
				}
			} else if (data.ballPosition.y > (PONG_HEIGHT - BALL_HEIGHT - PADDLE_HEIGHT)) {
				const paddleSection = paddleCollision(paddles.paddle2Pos);
				if (paddleSection > 0) {
					bounceBall(paddleSection);
					data.ballPosition.y = PONG_HEIGHT - BALL_HEIGHT - PADDLE_HEIGHT;
				} else {
					const runtimeIndex = this.ballRuntime.indexOf(data);
					this.OnPlayerWin(this.roomID[runtimeIndex], 1);
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
					const runtimeIndex = this.ballRuntime.indexOf(data);
					this.OnPlayerWin(this.roomID[runtimeIndex], 2);
				} else {
					bounceBall(getRandomInt(1, 6));
					data.ballPosition.y = PADDLE_HEIGHT;
					const ballWidth = Math.min(data.ballWidth + BALL_CUSTOM_GAIN, BALL_MAX_WIDTH);
					data.ballWidth = ballWidth;
					return;
				}
			} else if (data.ballPosition.y > (PONG_HEIGHT - BALL_HEIGHT - (PADDLE_HEIGHT / 2))) {
				if (paddleCollision(paddles.paddle2Pos, paddles.paddleWidth)) {
					const runtimeIndex = this.ballRuntime.indexOf(data);
					this.OnPlayerWin(this.roomID[runtimeIndex], 1);
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
				ballEvents.add(this.roomID[index]);
		}, this);

		// BALL EVENTS
		ballEvents.forEach(function(roomID) {
			const runtimeIndex = this.GetRuntimeIndexByRoomID(roomID);
			this.pongGateway.EmitBallDelta(roomID, this.ballRuntime[runtimeIndex]);
		}, this);

		ballEvents.clear();
	}
}
