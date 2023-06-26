import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Interval } from '@nestjs/schedule';
import { Server, Socket } from "socket.io";
import { Injectable } from '@nestjs/common';
import { PongService, PongInitData, BallRuntimeData, PaddleRuntimeData, SocketPair, Score } from './pong.service';
import { initialize } from 'passport';
import { DataSource } from 'typeorm';

@Injectable()
@WebSocketGateway({ cors: { origin: process.env.FRONTEND }, namespace: 'pong' })
export class PongGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(private readonly pongService: PongService) {
    pongService.RegisterGateway(this);
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    console.log("New socket connected to pong backend: " + socket.id);
    //const initDatas = this.pongService.Init(socket);
    //console.log("Initing pong");
    //socket.emit('init', initDatas);
  }

  handleDisconnect(socket: Socket) {
    console.log("Socket disconnected from pong :" + socket.id);
    this.pongService.CloseRoom(socket.id);
  }

  afterInit(socket: Socket) {
    console.log("Pong Gateway successfully init");
    this.pongService.LaunchUpdates();
  }

  @SubscribeMessage('queue')
  handleQueue(@ConnectedSocket() socket: Socket) {
    this.pongService.JoinQueue(socket);
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

  EmitInit(sockets: SocketPair, initDatas: PongInitData) {
    sockets.socketP1.emit('init', initDatas);
    sockets.socketP2.emit('init', initDatas);
  }

  EmitStartGame(sockets: SocketPair) {
    sockets.socketP1.emit('StartGame');
    sockets.socketP2.emit('StartGame');
  }

  EmitBallDelta(sockets: SocketPair, datas: BallRuntimeData) {
    //console.log("BallDelta");
    sockets.socketP1.emit('BallDelta', datas);
    sockets.socketP2.emit('BallDelta', datas);
  }

  EmitPaddleDelta(sockets: SocketPair, datas: PaddleRuntimeData) {
    //console.log("PaddleDelta");
    sockets.socketP1.emit('PaddleDelta', datas);
    sockets.socketP2.emit('PaddleDelta', datas);
  }

  EmitScore(sockets: SocketPair, datas: Score) {
    sockets.socketP1.emit('UpdateScore', datas);
    sockets.socketP2.emit('UpdateScore', datas);
  }
}
