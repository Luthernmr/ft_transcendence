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

@WebSocketGateway({ cors: { origin: process.env.FRONTEND },namespace: 'user' })
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


		try {
			const user: User = await this.authService.getUserByToken(client.handshake.auth.token)
			if (user) {
				await this.userService.setSocket(user.id, client.id);
				console.log('userAuthed', user)
			}
		}
		catch (error) {
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
	async Friend(client: Socket, data: {
		userSenderId: any,
		userReceiveId: any,
	}) {
		console.log('friendRequest : ', data.userSenderId, data.userReceiveId, client.id);
		//faire les verif (if les deux user sont ou pas amis)
		const userReceiv: any = await this.userService.getUserById(data.userReceiveId)
		const userSender: any = await this.userService.getUserById(data.userSenderId)
		const otherId = userReceiv.socketId;
		const pendingRequest = await this.userService.createPendingRequest({
			type: "Friend",
			senderId: data.userSenderId,
			senderNickname: userSender.nickname,
			user: userReceiv
		})
		client.to(otherId).emit('notifyRequest');
		console.log("client: ", client.id + " request to ", ' other', otherId,)

		// Gérer le cas où l'ID du socket de l'autre utilisateur est invalide
	}

	@SubscribeMessage('acceptFriendRequest')
	async acceptFriendRequest(client: Socket, data: {
		requestId: any,
	}) {
		//console.log('accepted', data.requestId)

		try {
			const currentUser: any = await this.authService.getUserByToken(client.handshake.auth.token)
			const request: any = await this.userService.getPendingRequestById(data.requestId);
			const friendUser = await this.userService.getUserById(request.senderId)
			console.log('friendUser', friendUser)
			await this.friendService.addFriend({
				userA: currentUser,
				userB: friendUser
			})
			//client.emit('getFriends')
			client.emit('requestAcccepted')
			await this.userService.deletePendingRequestById(data.requestId);
		}
		catch (error) { console.log(error) }
		//add user to friendship
	}

	@SubscribeMessage('getFriends')
	async getFriendsList(client: Socket) {

		try
		{
			const currentUser: any = await this.authService.getUserByToken(client.handshake.auth.token)
			const friendList =  await this.friendService.getFriends(currentUser);
			client.emit('friendsList', friendList)

		}
		catch(error)
		{
			console.log(error);
		}
	}

	@SubscribeMessage('getPendingRequest')
	async getPendingRequest(client: Socket) {

		try
		{
			const currentUser: any = await this.authService.getUserByToken(client.handshake.auth.token)
			const pendingRequests=  await this.userService.getAllPendingRequest(currentUser)
			client.emit('pendingRequestsList', pendingRequests)

		}
		catch(error)
		{
			console.log(error);
		}
	}

	@SubscribeMessage('rejectFriendRequest')
	rejectFriendRequest(@MessageBody() data: {
		requestId: any,
		userSenderId: any,
		userReceiveId: any
	}) {

	}


}
