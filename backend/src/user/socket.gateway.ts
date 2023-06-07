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
import { FriendService } from 'src/social/friend.service';
import { PendingRequest } from 'src/social/pendingRequest.entity';
import 'dotenv/config'

@WebSocketGateway({ cors: { origin: process.env.FRONTEND} })
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

    async handleConnection(client: Socket) {
		//recup le jwt dqns le socket et le decoder pour recup les data

		
		//await this.userService.setSocket(userId, client.id);
		console.log("token", console.log(client.handshake.auth.token));
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
		const request = await this.userService.createPendingRequest({
			type : "friend",
			senderId : data.userSenderId,
		})
		client.to(otherId).emit('pendingRequest', request);
		//console.log("client: ", client.id + " request to ", ' other',otherId, )
		
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
