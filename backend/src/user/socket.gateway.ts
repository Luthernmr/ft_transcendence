/*
https://docs.nestjs.com/websockets/gateways#gateways
*/

import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from "socket.io";
import { UserService } from './user.service';
import { User } from './user.entity';
import { FriendService } from 'src/social/friend.service';
import 'dotenv/config'
import { AuthService } from 'src/auth/auth.service';
import { BadRequestException } from '@nestjs/common';

//console.log('Websocket: ' + process.env.FRONTEND);

@WebSocketGateway({ cors: { origin: process.env.FRONTEND }, namespace: 'user' })
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly friendService: FriendService,
  ) {}

  async handleConnection(client: Socket) {
    let user: User = await this.authService.getUserByToken(
      client.handshake.auth.token,
    );
    //console.log('use on connexion:', user);
    if (user) {
      user = await this.userService.setSocket(user.id, client.id);
      await this.userService.setOnline(user);
    }
  }

  async handleDisconnect(client: Socket) {
    const user: User = await this.authService.getUserByToken(
      client.handshake.auth.token,
    );
    //console.log('use on deconnexion:', user);
    if (user) {
      await this.userService.setOffline(user);
    }
  }

  afterInit(server: Socket) {
    //console.log('Socket is live');
  }

  @SubscribeMessage('friendRequest')
  async Friend(
    client: Socket,
    data: {
      userReceiveId: any;
    },
  ) {
    const userSender: User = await this.authService.getUserByToken(
      client.handshake.auth.token,
    );
    const userReceiv: User = await this.userService.getUserById(
      data.userReceiveId,
    );

    const otherId = userReceiv.socketId;
    //console.log(
    //   'socket id receiv :',
    //   otherId,
    //   'socket id sender  :',
    //   userSender.socketId,
    // );
    try {
      const alreadyExist = await this.friendService.getRelation(
        userSender,
        userReceiv,
      );
      //console.log('relation', alreadyExist);
      if (alreadyExist != null)
        throw new BadRequestException(
          'Request already exists for this person.',
        );
      if (userReceiv.id == userSender.id)
        throw new BadRequestException('can t send request');
      await this.userService.createPendingRequest({
        type: 'Friend',
        senderId: userSender.id,
        senderNickname: userSender.nickname,
        senderPdp: userSender.imgPdp,
        user: userReceiv,
      });
      client.emit('sendSuccess');
      //console.log('servers socket', this.server.sockets);
    } catch (error) {
      client.emit('alreadyFriend');
    }
  }

  @SubscribeMessage('acceptFriendRequest')
  async acceptFriendRequest(
    client: Socket,
    data: {
      requestId: any;
    },
  ) {
    try {
      const currentUser: any = await this.authService.getUserByToken(
        client.handshake.auth.token,
      );
      const request: any = await this.userService.getPendingRequestById(
        data.requestId,
      );
      const friendUser = await this.userService.getUserById(request.senderId);
      const otherId = friendUser.socketId;
      const alreadyExist = await this.friendService.getRelation(
        friendUser,
        currentUser,
      );
      //console.log('relation', alreadyExist);
      if (alreadyExist != null) throw new BadRequestException('Already friend');
      await this.friendService.addFriend({
        userA: currentUser,
        userB: friendUser,
      });
      client.to(otherId).emit('reload');
      client.emit('requestAcccepted');
      await this.userService.deletePendingRequestById(request);
    } catch (error) {
      //console.log(error);
    }
  }

  @SubscribeMessage('rejectFriendRequest')
  async rejectFriendRequest(
    client: Socket,
    data: {
      requestId: any;
    },
  ) {
    try {
      //console.log('rejected', data.requestId);
      const request: any = await this.userService.getPendingRequestById(
        data.requestId,
      );
      await this.userService.deletePendingRequestById(request);
      //console.log('rejected', request);
      client.emit('requestRejected');
    } catch (error) {
      //console.log(error);
    }
  }

  @SubscribeMessage('getFriends')
  async getFriendsList(client: Socket) {
    try {
      const currentUser: any = await this.authService.getUserByToken(
        client.handshake.auth.token,
      );
      const friendList = await this.friendService.getFriends(currentUser);
      client.emit('friendsList', friendList);
    } catch (error) {
      //console.log(error);
    }
  }

  @SubscribeMessage('deleteFriend')
  async deleteFriend(client: Socket, data: { friendId: number }) {
    try {
      const currentUser: any = await this.authService.getUserByToken(
        client.handshake.auth.token,
      );
      const friendUser: any = await this.userService.getUserById(data.friendId);
      await this.friendService.deleteFriend(currentUser, friendUser);
      client.emit('reload');
    } catch (error) {
      //console.log(error);
    }
  }

  @SubscribeMessage('getAllUsers')
  async getAllUsers(client: Socket) {
    const users = await this.userService.getAllUser();
    client.emit('userList', users);
  }

  @SubscribeMessage('getPendingRequest')
  async getPendingRequest(client: Socket) {
    try {
      const currentUser: any = await this.authService.getUserByToken(
        client.handshake.auth.token,
      );
      const pendingRequests = await this.userService.getAllPendingRequest(
        currentUser,
      );
      client.emit('pendingRequestsList', pendingRequests);
    } catch (error) {
      //console.log(error);
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
    const userSender: User = await this.authService.getUserByToken(
      client.handshake.auth.token,
    );
    const userBlocked: any = await this.userService.getUserById(
      data.userBlockedId,
    );

    try {
      const alreadyBlock: any = await this.friendService.getBlockedRelation(
        userSender,
        userBlocked,
      );
      if (userSender.id == userBlocked.id || alreadyBlock)
        throw new BadRequestException('block error');
      await this.friendService.blockUser({
        currentUser: userSender,
        otherUser: userBlocked,
      });
      client.emit('userHasBlocked');
    } catch (error) {
      //console.log(error);
      client.emit('alreadyBlocked');
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
      //console.log(error);
    }
  }

  @SubscribeMessage('unblockUser')
  async unBlockUser(client: Socket, data: { blockedId: any }) {
    try {
      const currentUser: any = await this.authService.getUserByToken(
        client.handshake.auth.token,
      );
      const otherUser: any = await this.userService.getUserById(data.blockedId);
      await this.friendService.unblockUser(currentUser, otherUser);
      client.emit('userHasBlocked');
    } catch (error) {
      //console.log(error);
    }
  }
}
