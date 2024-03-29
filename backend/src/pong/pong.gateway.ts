import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Interval } from '@nestjs/schedule';
import { Server, Socket } from "socket.io";
import { Inject, Injectable } from '@nestjs/common';
import { PongService, PongInitData, BallRuntimeData, PaddleRuntimeData, Score, GameDatas, UserDatas } from './pong.service';
import { User } from '../user/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { GlobalGateway } from 'src/websockets/global.gateway';

@Injectable()
@WebSocketGateway({ cors: { origin: "*" }, namespace: 'pong' })
export class PongGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
  // @WebSocketServer()
  // gateway.pongNamespace: Server

  constructor(
    private readonly authService: AuthService,
    private readonly pongService: PongService,
    private readonly gateway: GlobalGateway) {
    pongService.RegisterGateway(this);
  }

  async handleConnection(client: Socket) {
	try {
		let user: User = await this.authService.getUserByToken(
			client.handshake.auth.token,
			);
			if (user) {
			client.emit('success', { message: "Connected" });
			this.RegisterUserToPong(client, client.handshake.auth.token);

		} else client.disconnect();

	} catch(error) {
		client.emit('error', { message: error.message });
	}
}

  @SubscribeMessage('register')
  handleRegistration(@ConnectedSocket() socket: Socket, @MessageBody() datas: { token: string }) {
    this.RegisterUserToPong(socket, datas.token);
  }


  async RegisterUserToPong(socket: Socket, token: string) {
    let user: User = await this.authService.getUserByToken(token);
		if (user) {
      this.pongService.RegisterUserInfos(user.id, socket);
    } else {
      //console.log("User not found, token = " + token);
    }
  }

  handleDisconnect(socket: Socket) {
    this.pongService.UnregisterUserInfos(socket);
  }

  afterInit(socket: Socket) {
    this.pongService.LaunchUpdates();
  }

  @SubscribeMessage('requestGameState')
  async handleGameStateRequest(@ConnectedSocket() socket: Socket) {
    this.pongService.RequestGameState(socket);
  }

  @SubscribeMessage('queue')
  handleQueue(@ConnectedSocket() socket: Socket, @MessageBody() datas: { custom: boolean } ) {
    this.pongService.JoinQueue(socket, datas.custom);
  }

  @SubscribeMessage('leaveQueue')
  handleLeaveQueue(@ConnectedSocket() socket: Socket, @MessageBody() datas: { custom: boolean } ) {
    this.pongService.LeaveQueueBySocket(socket);
  }

  @SubscribeMessage('clientReady')
  handleReady(@ConnectedSocket() socket: Socket) {
    this.pongService.ClientIsReady(socket);
  }

  @SubscribeMessage('requestRestart')
  handleResquestRestart(@ConnectedSocket() socket: Socket) {
    this.pongService.RequestRestart(socket);
  }

  @SubscribeMessage('quit')
  handleQuit(@ConnectedSocket() socket: Socket) {
    this.pongService.UserQuit(socket);
  }

  @SubscribeMessage('keydown')
  handlePaddleKeydown(@ConnectedSocket() socket: Socket, @MessageBody() input: number) {
    this.pongService.PaddleKeyDown(socket.id, input);
  }
;
  @SubscribeMessage('keyup')
  handlePaddleKeyup(@ConnectedSocket() socket: Socket, @MessageBody() input: number) {
    this.pongService.PaddleKeyUp(socket.id, input);
  }

  @SubscribeMessage('Watch')
  handleWatch(@ConnectedSocket() socket: Socket) {
    const watch = this.pongService.WatchRandom(socket);
    if (watch === false)
      return {status: "NONE"};
    return {status: "OK"};
  }

  @SubscribeMessage('LeaveWatch')
  handleLeaveWatch(@ConnectedSocket() socket: Socket) {
    this.pongService.RemoveWatcherBySocket(socket);
  }

  private EmitEvent(event: string, roomID: number, datas: any) {
    this.gateway.pongNamespace.to("room" + roomID).emit(event, datas);
  }

  EmitGameState(socket: Socket, gameState: GameDatas) {
    socket.emit('gamestate', gameState);
  }

  ReloadList() {
	this.gateway.userNamespace.emit('reloadLists')
  }

  CloseRoom(roomID: number) {
    this.gateway.pongNamespace.socketsLeave("room" + roomID);
  }

  EmitInit(socket: Socket, initDatas: PongInitData) {
    socket.emit('Init', initDatas);
  }

  EmitStartGame(roomID: number, delaySeconds: number) {
    this.EmitEvent('StartGame', roomID, delaySeconds);
  }

  EmitBallDelta(roomID: number, datas: BallRuntimeData) {
    this.EmitEvent('BallDelta', roomID, datas);
  }

  EmitPaddleDelta(roomID: number, datas: PaddleRuntimeData) {
    this.EmitEvent('PaddleDelta', roomID, datas);
  }

  EmitScore(roomID: number, datas: Score) {
    this.EmitEvent('UpdateScore', roomID, datas);
  }

  EmitEnd(roomID: number, datas: number) {
    this.EmitEvent('End', roomID, datas);
  }

  EmitWatcher(socket: Socket, datas: any) {
    socket.emit('Watcher', datas);
  }

  EmitOpponentDisconnect(socket: Socket) {
    socket?.emit('OpponentDisconnected')
  }

  EmitPlayerDisconnected(roomID: number, p: number) {
    this.EmitEvent('PlayerDisconnected', roomID, p);
  }

  EmitOpponentReconnected(socket: Socket) {
    socket.emit('OpponentReconnected')
  }

  EmitOpponentQuit(socket: Socket) {
    socket?.emit('OpponentQuit');
  }

  EmitPlayerReconnected(roomID: number, p: number) {
    this.EmitEvent('PlayerReconnected', roomID, p);
  }

  EmitAddWatcher(roomID: number, datas: UserDatas) {
    this.EmitEvent('AddWatcher', roomID, datas);
  }

  EmitRemoveWatcher(roomID: number, id: number) {
    this.EmitEvent('RemoveWatcher', roomID, id);
  }

  EmitSetStartingPlayer(roomID: number, startingPlayer: number) {
    this.EmitEvent('SetStartingPlayer', roomID, startingPlayer);
  }

  EmitCountdown(roomID: number, countdown: number) {
    this.EmitEvent('Countdown', roomID, countdown);
  }
}
