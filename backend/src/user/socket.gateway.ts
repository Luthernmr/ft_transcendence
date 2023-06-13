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
import { AuthService } from 'src/auth/auth.service';
import { NotificationKind } from 'rxjs';

console.log("Websocket: " + process.env.FRONTEND);

@WebSocketGateway({ cors: { origin: process.env.FRONTEND } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    server: Server;
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,

	) { }

    //@SubscribeMessage('events')
   // handleEvent(@MessageBody() data: string) {
   //     this.server.emit('events', data);
   // }

    async handleConnection(client: Socket) {
		//recup le jwt dqns le socket et le decoder pour recup les data

		
		const user : any = this.authService.getUserByToken(client.handshake.auth.token)
		if (user)
		{
			await this.userService.setSocket(user.id, client.id);
		}

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
		const userReceiv : any = await this.userService.getUserById(data.userReceiveId)
		const otherId = userReceiv.socketId;
		const pendingRequest = await this.userService.createPendingRequest({
			type : "friend",
			senderId : data.userSenderId,
			user : userReceiv
		})
		client.to(otherId).emit('pendingRequest');
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
