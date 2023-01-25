/*
https://docs.nestjs.com/websockets/gateways#gateways
*/

import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('message')
    handleEvent(@MessageBody() data: any) {
        this.server.emit('message', data);
		console.log(data);
    }

    handleConnection(client: Socket) {
        console.log(`User connected ${client.id}`);
    }

    handleDisconnect(client: Socket) {
		this
        console.log(`User disconnected ${client.id}`);
    }

    afterInit(server: Server) {
        console.log(`Socket is live : ${server}`)
    }
}
