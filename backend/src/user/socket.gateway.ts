import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserService } from './user.service';
import { User } from './user.entity';
import { FriendService } from 'src/social/friend.service';
import 'dotenv/config';
import { AuthService } from 'src/auth/auth.service';
import { BadRequestException, Logger } from '@nestjs/common';
import { PongService } from 'src/pong/pong.service';
import { PendingRequest } from 'src/social/pendingRequest.entity';
import { ChatService } from 'src/chat/chat.service';
import { GlobalGateway } from 'src/websockets/global.gateway';

@WebSocketGateway({ cors: { origin: process.env.FRONTEND }, namespace: 'user' })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private logger: Logger;
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,
		private readonly friendService: FriendService,
		private readonly pongService: PongService,
		private readonly gateway: GlobalGateway,
	) {
		this.logger = new Logger(ChatService.name);
	}

	async handleConnection(client: Socket) {
		try {
			let user: User = await this.authService.getUserByToken(
				client.handshake.auth.token,
			);
			if (user) {
				await this.userService.setOnline(user);
				setInterval(async () => {
					let users = (await this.userService.getAllUserOnline());
					//console.log(users);
					for (let user of users) {
						const otherSocket = await this.authService.getUserSocket(
							this.gateway.userNamespace,
							user.id,
						);
					//	console.log('others', otherSocket)
						if (!otherSocket)
							this.userService.setOffline(user);
					};
			}, 10000);
			this.gateway.userNamespace.emit('reloadLists');
		} else client.disconnect();

	} catch(error) {
		client.emit('error', { message: error.message });
	}
}

@SubscribeMessage('pong')
async pong(client: Socket){

	try {
		console.log('pong')
		let user: User = await this.authService.getUserByToken(
			client.handshake.auth.token,
		);
		if (!user)
			this.handleDisconnect(client)
	} catch (error) {
		//console.log(' Error while decoding token',error)
		this.handleDisconnect(client);
		return;
	}
}

	async handleDisconnect(client: Socket) {
	try {

		const user: User = await this.authService.getUserByToken(
			client.handshake.auth.token,
		);
		if (user) {
			await this.userService.setOffline(user);
			this.gateway.userNamespace.emit('reloadLists');
		}
	} catch (error) {
		client.emit('error', { message: error.message });
	}
}

@SubscribeMessage('friendRequest')
async Friend(
	client: Socket,
	data: {
	userReceiveId: number;
},
) {

	try {
		const userSender: User = await this.authService.getUserByToken(
			client.handshake.auth.token,
		);
		const userReceiv: User = await this.userService.getUserById(
			data.userReceiveId,
		);
		const alreadyExist = await this.friendService.getRelation(
			userSender,
			userReceiv,
		);
		if (alreadyExist != null)
			throw new BadRequestException('Alreedy friend.');
		if (userReceiv.id == userSender.id)
			throw new BadRequestException('Cannot invite yourself');
		await this.userService.createPendingRequest({
			type: 'Friend',
			senderId: userSender.id,
			senderNickname: userSender.nickname,
			senderPdp: userSender.imgPdp,
			user: userReceiv,
		});
		const otherSocket = await this.authService.getUserSocket(
			this.gateway.userNamespace,
			userReceiv.id,
		);
		if (!otherSocket)
			throw new BadRequestException('Cannot request offline person');
		otherSocket.emit('notifyRequest');
		client.emit('success', { message: "Friend request sent" });

	} catch (error) {
		client.emit('error', { message: error.message });
	}
}

@SubscribeMessage('PongRequest')
async PongRequest(
	client: Socket,
	data: {
	userReceiveId: number;
},
) {
	try {
		const userSender: User = await this.authService.getUserByToken(
			client.handshake.auth.token,
		);
		const userReceiv: User = await this.userService.getUserById(
			data.userReceiveId,
		);
		if (userReceiv.id == userSender.id)
			throw new BadRequestException('Cannot play with yourself');
		await this.userService.createPendingRequest({
			type: 'Pong',
			senderId: userSender.id,
			senderNickname: userSender.nickname,
			senderPdp: userSender.imgPdp,
			user: userReceiv,
		});
		const otherSocket = await this.authService.getUserSocket(
			this.gateway.userNamespace,
			userReceiv.id,
		);
		if (!otherSocket)
			throw new BadRequestException('Cannot request offline person');
		otherSocket.emit('notifyRequest');
		client.emit('success', { message: "Pong request sent" });
	} catch (error) {
		client.emit('error', { message: error.message });
	}
}

@SubscribeMessage('acceptPongRequest')
async acceptPongRequest(
	client: Socket,
	data: {
	requestId: number;
},
) {
	try {
		const currentUser: User = await this.authService.getUserByToken(
			client.handshake.auth.token,
		);
		const request: PendingRequest =
			await this.userService.getPendingRequestById(data.requestId);
		this.pongService.AcceptInvitation(currentUser?.id, request?.senderId);
		const otherSocket = await this.authService.getUserSocket(
			this.gateway.userNamespace,
			request.senderId,
		);
		client.emit('duelAcccepted');
		otherSocket.emit('duelAcccepted');
		await this.userService.deletePendingRequestById(request);
	} catch (error) {
		client.emit('error', { message: error.message });
	}
}

@SubscribeMessage('acceptFriendRequest')
async acceptFriendRequest(
	client: Socket,
	data: {
	requestId: number;
},
) {
	try {
		const currentUser: User = await this.authService.getUserByToken(
			client.handshake.auth.token,
		);
		const request: PendingRequest =
			await this.userService.getPendingRequestById(data.requestId);
		const friendUser: User = await this.userService.getUserById(
			request.senderId,
		);
		const otherId = friendUser.socketId;
		const alreadyExist = await this.friendService.getRelation(
			friendUser,
			currentUser,
		);
		if (alreadyExist != null) throw new BadRequestException('Already friend');
		await this.friendService.addFriend({
			userA: currentUser,
			userB: friendUser,
		});
		client.to(otherId).emit('reload');
		client.emit('requestAcccepted');
		await this.userService.deletePendingRequestById(request);
	} catch (error) {
		client.emit('error', { message: error.message });
	}
}

@SubscribeMessage('rejectRequest')
async rejectRequest(
	client: Socket,
	data: {
	requestId: number;
},
) {
	try {
		const request: PendingRequest =
			await this.userService.getPendingRequestById(data.requestId);
		await this.userService.deletePendingRequestById(request);
		client.emit('requestRejected');
	} catch (error) {
		client.emit('error', { message: error.message });
	}
}

@SubscribeMessage('getFriends')
async getFriendsList(client: Socket) {
	try {
		const currentUser: User = await this.authService.getUserByToken(
			client.handshake.auth.token,
		);
		const friendList = await this.friendService.getFriends(currentUser);
		client.emit('friendsList', friendList);
	} catch (error) {
		client.emit('error', { message: error.message });
	}
}

@SubscribeMessage('deleteFriend')
async deleteFriend(client: Socket, data: { friendId: number }) {
	try {
		const currentUser: User = await this.authService.getUserByToken(
			client.handshake.auth.token,
		);
		const friendUser: User = await this.userService.getUserById(
			data.friendId,
		);
		await this.friendService.deleteFriend(currentUser, friendUser);
		client.emit('reload');

	} catch (error) {
		client.emit('error', { message: error.message });
	}
}

@SubscribeMessage('getAllUsers')
async getAllUsers(client: Socket) {
	try {
		const users: User[] = await this.userService.getAllUser();
		client.emit('userList', users);

	} catch (error) {
		client.emit('error', { message: error.message });
	}
}

@SubscribeMessage('getPendingRequest')
async getPendingRequest(client: Socket) {
	try {
		const currentUser: User = await this.authService.getUserByToken(
			client.handshake.auth.token,
		);
		const pendingRequests = await this.userService.getAllPendingRequest(
			currentUser,
		);
		client.emit('pendingRequestsList', pendingRequests);
	} catch (error) {
		client.emit('error', { message: error.message });
	}
}

/* -------------------------------------------------------------------------- */
/*                             BlockUser Features                             */
/* -------------------------------------------------------------------------- */

@SubscribeMessage('blockUser')
async blockUser(
	client: Socket,
	data: {
	userBlockedId: any;
},
) {

	try {
		const userSender: User = await this.authService.getUserByToken(
			client.handshake.auth.token,
		);
		const userBlocked: any = await this.userService.getUserById(
			data.userBlockedId,
		);
		const alreadyBlock: any = await this.friendService.getBlockedRelation(
			userSender,
			userBlocked,
		);
		if (userSender.id == userBlocked.id || alreadyBlock)
			throw new BadRequestException('Cannot block this user');
		await this.friendService.blockUser({
			currentUser: userSender,
			otherUser: userBlocked,
		});
		client.emit('userHasBlocked');
		this.deleteFriend(client, data.userBlockedId);
		client.emit('success', { message: "User blocked and deleted" });
	} catch (error) {
		client.emit('error', { message: error.message });
	}
}

@SubscribeMessage('getBlockedList')
async getBlockList(client: Socket) {
	try {
		const currentUser: any = await this.authService.getUserByToken(
			client.handshake.auth.token,
		);
		const blockedList: any = await this.friendService.getBlockedUsers(
			currentUser,
		);
		client.emit('blockedList', blockedList);
	} catch (error) {
		client.emit('error', { message: error.message });
	}
}

@SubscribeMessage('unblockUser')
async unBlockUser(client: Socket, data: { blockedId: number }) {
	try {
		const currentUser: User = await this.authService.getUserByToken(
			client.handshake.auth.token,
		);
		const otherUser: User = await this.userService.getUserById(
			data.blockedId,
		);
		await this.friendService.unblockUser(currentUser, otherUser);
		client.emit('userHasBlocked');
	} catch (error) {
		client.emit('error', { message: error.message });
	}
}
}
