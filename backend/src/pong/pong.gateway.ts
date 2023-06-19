import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Interval } from '@nestjs/schedule';
import { Server, Socket } from "socket.io";
import { Injectable } from '@nestjs/common';
import { PongService, PongRuntimeData } from './pong.service';
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
  handleEvent(@ConnectedSocket() socket: Socket) {
    if (this.pongService.StartRoom(socket))
      return true;
    return false;
  }

  EmitChangeDir(datas: PongRuntimeData) {
    const payload = { ballPosition: datas.ballPosition, ballDelta: datas.ballDelta }
    console.log("emitChangeDir");
    datas.socketP1.emit('ChangeDir', payload);
    datas.socketP2.emit('ChangeDir', payload);
  }
}
