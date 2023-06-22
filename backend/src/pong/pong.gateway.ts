import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Interval } from '@nestjs/schedule';
import { Server, Socket } from "socket.io";
import { Injectable } from '@nestjs/common';
import { PongService, BallRuntimeData, PaddleRuntimeData } from './pong.service';
import { initialize } from 'passport';
import { DataSource } from 'typeorm';

interface SocketPair {
  socketP1: Socket,
  socketP2: Socket
}

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
    if (this.pongService.StartRoom(socket))
      return true;
    return false;
  }

  @SubscribeMessage('keydown')
  handlePaddleKeydown(@ConnectedSocket() socket: Socket, @MessageBody() input: number) {
    this.pongService.PaddleKeyDown(socket.id, input);
    console.log("Received keydown input " + input + " from socketID: " + socket.id);
  }
;
  @SubscribeMessage('keyup')
  handlePaddleKeyup(@ConnectedSocket() socket: Socket, @MessageBody() input: number) {
    this.pongService.PaddleKeyUp(socket.id, input);
    console.log("Received keyup input " + input + " from socketID: " + socket.id);
  }

  EmitPaddleDelta(datas: PaddleRuntimeData & SocketPair) {
    const payload = {
      paddle1Height: datas.paddle1Height,
      paddle1Delta: datas.paddle1Delta,
      paddle2Height: datas.paddle2Height,
      paddle2Delta: datas.paddle2Delta,
    };
    console.log("emitPaddleDelta");
    datas.socketP1.emit('PaddleDelta', payload);
    datas.socketP2.emit('PaddleDelta', payload);
  }

  EmitChangeDir(datas: BallRuntimeData & SocketPair) {
    const payload = { ballPosition: datas.ballPosition, ballDelta: datas.ballDelta };
    console.log("emitChangeDir");
    datas.socketP1.emit('ChangeDir', payload);
    datas.socketP2.emit('ChangeDir', payload);
  }
}
