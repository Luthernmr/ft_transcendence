import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: '*:*' })
export class TestGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  
  afterInit() {
    console.log("Server Gateway initialized");
  }

  handleConnection() {
    console.log("new client connected");
  }

  @SubscribeMessage('hello')
  handleMessage(@MessageBody() data: string): string {
    return 'Hello world! This is my GATEWAY!!';
  }
}
