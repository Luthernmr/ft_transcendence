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

console.log("Websocket: " + process.env.FRONTEND);

@WebSocketGateway({ cors: { origin: process.env.FRONTEND } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    server: Server;
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,
		private readonly friendService: FriendService,

	) { }

    //@SubscribeMessage('events')
   // handleEvent(@MessageBody() data: string) {
   //     this.server.emit('events', data);
   // }

    async handleConnection(client: Socket) {
		//recup le jwt dqns le socket et le decoder pour recup les data

		
		try
		{
			const user : any = this.authService.getUserByToken(client.handshake.auth.token)
			console.log('usser', user)
			if (user)
			{
				await this.userService.setSocket(user.id, client.id);
			}
		}
		catch(error)
		{
			console.log(error);
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
		const userSender : any = await this.userService.getUserById(data.userSenderId)
		const otherId = userReceiv.socketId;
		const pendingRequest = await this.userService.createPendingRequest({
			type : "Friend",
			senderId : data.userSenderId,
			senderNickname : userSender.nickname,
			user : userReceiv
		})
		client.to(otherId).emit('pendingRequest');
		console.log("client: ", client.id + " request to ", ' other',otherId, )
		
			// Gérer le cas où l'ID du socket de l'autre utilisateur est invalide
	}

	@SubscribeMessage('acceptFriendRequest')
	acceptFriendRequest(@MessageBody() data: {
		requestId : any,
		userReceiveId : any}){
		console.log('accepted', data.requestId)

		const ret = this.userService.getPendingRequestById(data.requestId);

		console.log('ret', ret);
		this.userService.deletePendingRequestById(data.requestId);
			//add user to friendship
	}

	@SubscribeMessage('rejectFriendRequest')
	rejectFriendRequest(@MessageBody() data: {
		requestId : any,
		userSenderId : any,
		userReceiveId : any}){
			
	}
}
