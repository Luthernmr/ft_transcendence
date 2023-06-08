import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Interval } from '@nestjs/schedule';
import { Server, Socket } from "socket.io";
import { Injectable } from '@nestjs/common';
import { PongService } from './pong.service';

interface ChangeDirData {
  socket: Socket,
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
  }

  afterInit(socket: Socket) {
    console.log("Pong Gateway successfully init");
    this.pongService.LaunchUpdates();
    //setInterval(this.updateBall.bind(this), 12);
  }
  
  @SubscribeMessage('start')
  handleEvent(@ConnectedSocket() socket: Socket) {
    this.pongService.StartRoom({
      socket: socket,
      ballX: 390,
      ballY: 290,
      dX: 10,
      dY: 10,
    })
  }

  EmitChangeDir(datas: ChangeDirData) {
    datas.socket.emit('ChangeDir', {dX: datas.dX, dY: datas.dY });
    console.log("Emitted change dir");
  }

  // @Interval(12)
  // updateBall() {
  //   console.log(this.x > 499);
  //   if (this.x > 499)
  //     this.dir = "left";
  //   else if (this.x < 201)
  //     this.dir = "right";

  //   if (this.dir === "right")
  //     this.x += 1;
  //   else if (this.dir === "left")
  //     this.x -= 1;

  //   this.server.emit('moveBall', {x: this.x, y: this.y});
  //   console.log("dir: " + this.dir);
  //   console.log("emitted: x: " + this.x + ", y: " + this.y);
  // }
}
