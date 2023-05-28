/*
https://docs.nestjs.com/websockets/gateways#gateways
*/

import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { use } from 'passport';
import { Server, Socket } from "socket.io";
import { UserService } from './user.service';
import { User } from './user.entity';
import { validate } from 'class-validator';
import { SocketAddress } from 'net';

@WebSocketGateway({ cors: { origin: ['http://212.227.209.204:3000'] , cookie: true} })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    server: Server;
	constructor(
		private readonly userService: UserService,
	) { }

    //@SubscribeMessage('events')
   // handleEvent(@MessageBody() data: string) {
   //     this.server.emit('events', data);
   // }

    handleConnection(client: Socket,  auth : any) {
		const userId = JSON.parse(client.handshake.auth.token).id;
		this.userService.setSocket(userId, client.id);
		console.log("connected socket id : ", client.id);
    }

    handleDisconnect(client: Socket) {
		console.log("disconnected socket id : ", client.id);
    }

    afterInit(server: Socket) {
        console.log('Socket is live')
    }

	@SubscribeMessage('friendRequest')
	async Friend(client : Socket, data: {
		userSenderId : any,
		userReceiveId : any, 
		}){
		console.log('friendRequest : ', data.userSenderId , data.userReceiveId, client.id);
		//faire les verif (if les deux user sont ou pas amis)
		const userReceiv = await this.userService.getUserById(data.userReceiveId)
		const otherId = userReceiv.socketId;
		client.to(otherId).emit('pendingRequest', data.userSenderId);
		console.log("client: ", client.id + " request to ", ' other',otherId, )
		
			// Gérer le cas où l'ID du socket de l'autre utilisateur est invalide
	}

	@SubscribeMessage('acceptFriendRequest')
	acceptFriendRequest(@MessageBody() data: {
		validate : any,
		userSenderId : any,
		userReceiveId : any}){
		if (validate)
			console.log('accepted')
			//add user to friendship
	}
}
