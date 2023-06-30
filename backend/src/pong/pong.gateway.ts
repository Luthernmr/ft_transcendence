import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Interval } from '@nestjs/schedule';
import { Server, Socket } from "socket.io";
import { Injectable } from '@nestjs/common';
import { PongService, PongInitData, BallRuntimeData, PaddleRuntimeData, SocketPair, Score, WatcherInitDatas, PongInitEntities } from './pong.service';
import { initialize } from 'passport';
import { DataSource } from 'typeorm';
import { IoAdapter } from '@nestjs/platform-socket.io';

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
  handleQueue(@ConnectedSocket() socket: Socket, @MessageBody() datas: { userID: number, custom: boolean } ) {
    this.pongService.JoinQueue(socket, datas.userID, datas.custom);
    console.log("Joined queue, userID: " + datas.userID);
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

  @SubscribeMessage('restart')
  handleRestart(@ConnectedSocket() socket: Socket) {
    this.pongService.RestartNewGame(socket);
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

  EmitInit(roomID: number, initDatas: PongInitData & PongInitEntities) {
    this.EmitEvent('Init', roomID, initDatas);
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
