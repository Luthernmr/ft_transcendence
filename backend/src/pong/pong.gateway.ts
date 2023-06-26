import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Interval } from '@nestjs/schedule';
import { Server, Socket } from "socket.io";
import { Injectable } from '@nestjs/common';
import { PongService, BallRuntimeData, PaddleRuntimeData, SocketPair } from './pong.service';
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
    const initDatas = this.pongService.Init(socket);
    console.log("Initing pong");
    socket.emit('init', initDatas);
  }

  handleDisconnect(socket: Socket) {
    console.log("Socket disconnected from pong :" + socket.id);
    this.pongService.CloseRoom(socket.id);
  }

  afterInit(socket: Socket) {
    console.log("Pong Gateway successfully init");
    this.pongService.LaunchUpdates();
  }

  @SubscribeMessage('start')
  handleStart(@ConnectedSocket() socket: Socket) {
    return this.pongService.StartRoom(socket);
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

  EmitOnCollision(sockets: SocketPair, datas: BallRuntimeData) {
    const payload = { ballPosition: datas.ballPosition, ballDelta: datas.ballDelta };
    console.log("onCollision");
    sockets.socketP1.emit('onCollision', payload);
    sockets.socketP2.emit('onCollision', payload);
  }

  EmitOnPaddleMove(sockets: SocketPair, datas: PaddleRuntimeData) {
    const payload = {
      paddle1Height: datas.paddle1Height,
      paddle1Delta: datas.paddle1Delta,
      paddle2Height: datas.paddle2Height,
      paddle2Delta: datas.paddle2Delta,
    };
    
    console.log("onPaddleMove");
    sockets.socketP1.emit('onPaddleMove', payload);
    sockets.socketP2.emit('onPaddleMove', payload);
  }
}
