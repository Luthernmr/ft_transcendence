import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Interval } from '@nestjs/schedule';
import { Server, Socket } from "socket.io";
import { Inject, Injectable } from '@nestjs/common';
import { PongService, PongInitData, BallRuntimeData, PaddleRuntimeData, Score, WatcherInitDatas, QueueState } from './pong.service';
import { User } from '../user/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Injectable()
@WebSocketGateway({ cors: { origin: process.env.FRONTEND }, namespace: 'pong' })
export class PongGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(
    private readonly authService: AuthService,
    private readonly pongService: PongService) {
    pongService.RegisterGateway(this);
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    console.log("New socket connected to pong backend: " + socket.id);
    
    if (socket.handshake.auth.token === null)
      return;

    this.RegisterUserToPong(socket, socket.handshake.auth.token);
  }

  async RegisterUserToPong(socket: Socket, token: string) {
    let user: User = await this.authService.getUserByToken(token);
		if (user) {
      this.pongService.RegisterUserInfos(user.id, socket);
    }
  }

  handleDisconnect(socket: Socket) {
    console.log("Socket disconnected from pong :" + socket.id);
    //this.pongService.CloseRoom(socket.id);
    this.pongService.UnregisterUserInfos(socket);
  }

  afterInit(socket: Socket) {
    console.log("Pong Gateway successfully init");
    this.pongService.LaunchUpdates();
  }

  @SubscribeMessage('requestGameState')
  handleGameStateRequest(@ConnectedSocket() socket: Socket) {
    const gameState = this.pongService.GetGameState(socket);
    console.log("Emitting gamesate " + gameState.pongState);
    socket.emit('gamestate', gameState);
  }

  @SubscribeMessage('register')
  handleRegistration(@ConnectedSocket() socket: Socket, @MessageBody() datas: { token: string }) {
    this.RegisterUserToPong(socket, datas.token);
  }

  @SubscribeMessage('queue')
  handleQueue(@ConnectedSocket() socket: Socket, @MessageBody() datas: { custom: boolean } ) {
    this.pongService.JoinQueue(socket, datas.custom);
  }

  EmitQueueState(socket: Socket, datas: { queueState: QueueState }) {
    console.log('Emitting queue state: ' + datas.queueState);
    socket.emit('Queue', datas.queueState);
  }

  @SubscribeMessage('ready')
  handleReady(@ConnectedSocket() socket: Socket) {
    this.pongService.ClientsIsReady(socket);
  }

  @SubscribeMessage('quit')
  handleQuit(@ConnectedSocket() socket: Socket) {
    this.pongService.UserQuit(socket);
  }

  // @SubscribeMessage('onPongConnection')
  // handleGetState(@ConnectedSocket() socket: Socket) {
  //   const gameState = this.pongService.GetGameState(socket);
  //   socket.emit('gamestate', gameState);
  // }

  @SubscribeMessage('keydown')
  handlePaddleKeydown(@ConnectedSocket() socket: Socket, @MessageBody() input: number) {
    this.pongService.PaddleKeyDown(socket.id, input);
  }
;
  @SubscribeMessage('keyup')
  handlePaddleKeyup(@ConnectedSocket() socket: Socket, @MessageBody() input: number) {
    this.pongService.PaddleKeyUp(socket.id, input);
  }

  @SubscribeMessage('watch')
  handleWatch(@ConnectedSocket() socket: Socket, @MessageBody() roomIndex: number) {
    this.pongService.AddWatcher(roomIndex, socket);
  }

  private EmitEvent(event: string, roomID: number, datas: any) {
    this.server.to("room" + roomID).emit(event, datas);
  }

  CloseRoom(roomID: number) {
    this.server.socketsLeave("room" + roomID);
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

  EmitWatcher(socket: Socket, datas: WatcherInitDatas) {
    socket.emit('Watcher', datas);
  }
}
