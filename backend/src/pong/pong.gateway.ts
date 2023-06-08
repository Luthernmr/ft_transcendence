import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Interval } from '@nestjs/schedule';
import { Server, Socket } from "socket.io";
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: process.env.FRONTEND}, namespace: 'pong' })
export class PongGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  x: number = 390;
  y: number = 290;
  dir: string = "right";

  constructor(
  ) {}

  @Interval(12)
  updateBall() {
    console.log(this.x > 499);
    if (this.x > 499)
      this.dir = "left";
    else if (this.x < 201)
      this.dir = "right";

    if (this.dir === "right")
      this.x += 1;
    else if (this.dir === "left")
      this.x -= 1;

    this.server.emit('moveBall', {x: this.x, y: this.y});
    console.log("dir: " + this.dir);
    console.log("emitted: x: " + this.x + ", y: " + this.y);
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    console.log("New socket connected to pong backend: " + socket.id);
  }

  handleDisconnect(socket: Socket) {
    console.log("Socket disconnected from pong :" + socket.id);
  }

  afterInit(socket: Socket) {
    console.log("Pong Gateway successfully init");
    console.log("server: " + this.server);
    //setInterval(this.updateBall.bind(this), 12);
  }
  
  @SubscribeMessage('event')
  handleEvent(client: any, payload: any): string {
    return 'message from pong!';
  }

  @SubscribeMessage('requestMoveBall')
  handleMoveBall(@ConnectedSocket() socket: Socket) {
    this.x += 1;
    socket.emit('moveBall', {x: this.x, y: this.y});
  }
}
