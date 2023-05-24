/*
https://docs.nestjs.com/websockets/gateways#gateways
*/

import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: ['http://212.227.209.204:3000'] } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('events')
    handleEvent(@MessageBody() data: string) {
        this.server.emit('events', data);
    }

    handleConnection(client: Socket) {
        console.log('User connected');
    }

    handleDisconnect(client: Socket) {
        console.log('User disconnected');
    }

    afterInit(server: Socket) {
        console.log('Socket is live')
    }
}
