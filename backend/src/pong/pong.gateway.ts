import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Interval } from '@nestjs/schedule';
import { Server, Socket } from "socket.io";
import { Injectable } from '@nestjs/common';
import { PongService } from './pong.service';

interface ChangeDirData {
  socket: Socket,
  ballX: number,
  ballY: number,
  dX: number,
  dY: number
}

@Injectable()
@WebSocketGateway({ cors: { origin: process.env.FRONTEND}, namespace: 'pong' })
export class PongGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(private readonly pongService: PongService) {
    pongService.RegisterGateway(this);
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    console.log("New socket connected to pong backend: " + socket.id);
  }

  handleDisconnect(socket: Socket) {
    console.log("Socket disconnected from pong :" + socket.id);
    this.pongService.CloseRoom(socket.id);
  }

  afterInit(socket: Socket) {
    console.log("Pong Gateway successfully init");
    this.pongService.LaunchUpdates();
    //setInterval(this.updateBall.bind(this), 12);
  }
  
  @SubscribeMessage('start')
  handleEvent(@ConnectedSocket() socket: Socket) {
    this.pongService.StartRoom(socket)
  }

  EmitChangeDir(datas: ChangeDirData) {
    const payload = { x: datas.ballX, y: datas.ballY, dX: datas.dX, dY: datas.dY }
    datas.socket.emit('ChangeDir', payload);
    console.log("Emitted change dir");
  }
}
