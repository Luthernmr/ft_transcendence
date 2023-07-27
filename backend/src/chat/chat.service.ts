import { Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RoomService } from 'src/room/room.service';
import { Room } from 'src/room/entities/room.entity';
import { UserService } from 'src/user/user.service';
import { MessageService } from 'src/message/message.service';
import { User } from 'src/user/user.entity';
import { AuthService } from 'src/auth/auth.service';
import * as bcrypt from 'bcrypt';
import { Message } from 'src/message/entities/message.entity';
import { GlobalGateway } from 'src/websockets/global.gateway';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
export class ChatService {
  private logger: Logger;

  constructor(
    private readonly roomService: RoomService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
    private readonly gateway: GlobalGateway,
  ) {
    this.logger = new Logger(ChatService.name);
  }

  onModuleInit() {
    this.logger.log('Gateway initialized');
  }

  async handleDisconnect(socket: Socket) {
    this.logger.log('id: ' + socket.id + ' disconnected');
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.log('id: ' + client.id + ' connected');
      let user: User = await this.authService.getUserByToken(
        client.handshake.auth.token,
      );
      if (user) {
        user = await this.userService.setSocket(user.id, client.id);
        await this.userService.setOnline(user);
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('createDirectMessageRoom')
  async handleCreateDirectMessageRoom(
    client: Socket,
    data: { targetUser: User; user: User },
  ) {
    try {
      const { targetUser, user } = data;
      const room = await this.createRoom(
        client,
        { users: [user, targetUser] },
        true,
      );
      if (room) {
        client.emit('directRoomCreated', room);
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('createRoom')
  async createRoom(
    client: Socket,
    data: Partial<Room>,
    isDirectMessage = false,
  ) {
    try {
      let room;
      if (isDirectMessage && data.users && data.users.length === 2) {
        const userNicknameShort = data.users[0].nickname.substring(0, 3);
        const targetUserNicknameShort = data.users[1].nickname.substring(0, 3);
        const sortedNicknames = [
          userNicknameShort,
          targetUserNicknameShort,
        ].sort();

        data.name = `${sortedNicknames[0]}${sortedNicknames[1]}`;
        data.isPrivate = true;
        room = await this.roomService.createRoom(client, data);
      } else {
        room = await this.roomService.createRoom(client, data);
      }
      data.users.forEach(async (element) => {
        const rooms = await this.userService.getRoomsByUID(element.id);
        this.gateway.chatNamespace
          .to(element.socketId)
          .emit('roomList', rooms.rooms);
      });
      this.gateway.chatNamespace.emit('roomCreated');
      return room;
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('getUserRooms')
  async getUserRooms(client: Socket, payload: { userId: number }) {
    try {
      const rooms = await this.roomService.getAllAccessibleRooms(
        payload.userId,
      );
      client.emit('roomList', rooms);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('checkRoomPassword')
  async checkRoomPass(
    client: Socket,
    payload: { room: Room; password: string },
  ) {
    try {
      const answer = await bcrypt.compare(
        payload.password,
        payload.room.password,
      );
      client.emit('passCheck', answer);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(client: Socket, data: Message) {
    try {
      const { text, room, user } = data;
      const isMuted = await this.roomService.isMuted(user.id, room.id);
      if (isMuted) {
        client.emit('error', { message: 'You are currently muted' });
        return;
      }
      const message = await this.messageService.createMessage(data);
      data.room.users.forEach(async (element) => {
        this.gateway.chatNamespace
          .to(element.socketId)
          .emit('receiveMessage', message);
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('getRoomMessages')
  async getRoomMessages(client: Socket, room: Room) {
    try {
      const messages = await this.messageService.getMessagesByRoom(room.name);
      client.emit('roomMessages', messages);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('deleteRoom')
  async deleteRoom(client: Socket, room: Room) {
    try {
      await this.roomService.deleteRoom(room.id);
      this.gateway.chatNamespace.emit('roomDeleted', room.name);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, data: { userId: number; room: Room }) {
    try {
      const { userId, room } = data;
      const updatedRoom = await this.roomService.addUserToRoom(userId, room);
      this.gateway.chatNamespace.emit('updatedRoom');
      client.emit('joinedRoom', updatedRoom);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(
    client: Socket,
    payload: { roomId: number; newOwnerId?: number },
  ) {
    try {
      const user = await this.authService.getUserByToken(
        client.handshake.auth.token,
      );
      const updatedRoom = await this.roomService.leaveRoom(user.id, payload);
      this.gateway.chatNamespace.emit('updatedRoom');
      updatedRoom.users.forEach(async (element) => {
        this.gateway.chatNamespace
          .to(element.socketId)
          .emit('leftRoom', user.nickname, updatedRoom);
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('changeRoomPassword')
  async changeRoomPassword(
    client: Socket,
    payload: { roomId: number; password: string },
  ) {
    try {
      const user = await this.authService.getUserByToken(
        client.handshake.auth.token,
      );
      if (user) {
        const updatedRoom = await this.roomService.updateRoomPassword(
          user.id,
          payload,
        );
        this.gateway.chatNamespace.emit('updatedRoom');
        updatedRoom.users.forEach(async (element) => {
          this.gateway.chatNamespace
            .to(element.socketId)
            .emit('roomPasswordChanged', updatedRoom);
        });
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('updateAdmins')
  async updateAdmins(
    client: Socket,
    payload: { roomId: number; adminList: User[] },
  ) {
    try {
      const user = await this.authService.getUserByToken(
        client.handshake.auth.token,
      );
      if (user) {
        const updatedRoom = await this.roomService.updateAdmins(
          user.id,
          payload,
        );
        this.gateway.chatNamespace.emit('updatedRoom');
        updatedRoom.users.forEach(async (element) => {
          this.gateway.chatNamespace
            .to(element.socketId)
            .emit('adminsUpdated', updatedRoom);
        });
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('kickUser')
  async kickUser(
    client: Socket,
    data: { targetUser: User; room: Room; user: User },
  ) {
    try {
      const { targetUser, room, user } = data;
      const updatedRoom = await this.roomService.kickUser(
        user.id,
        targetUser.id,
        room.id,
      );
      this.gateway.chatNamespace.emit('updatedRoom');
      room.users.forEach(async (element) => {
        if (element.id !== targetUser.id) {
          this.gateway.chatNamespace
            .to(element.socketId)
            .emit('userKicked', targetUser.nickname, updatedRoom);
        }
      });
      this.gateway.chatNamespace
        .to(targetUser.socketId)
        .emit('userKicked', targetUser.nickname, updatedRoom);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('banUser')
  async banUser(
    client: Socket,
    data: { targetUser: User; room: Room; user: User },
  ) {
    try {
      const { targetUser, room, user } = data;
      const updatedRoom = await this.roomService.banUser(
        user.id,
        targetUser.id,
        room.id,
      );
      this.gateway.chatNamespace.emit('updatedRoom');
      room.users.forEach(async (element) => {
        if (element.id !== targetUser.id) {
          this.gateway.chatNamespace
            .to(element.socketId)
            .emit('userBanned', targetUser.nickname, updatedRoom);
        }
      });
      this.gateway.chatNamespace
      .to(targetUser.socketId)
      .emit('userBanned', targetUser.nickname, updatedRoom);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('muteUser')
  async muteUser(
    client: Socket,
    data: { targetUser: User; room: Room; user: User },
  ) {
    try {
      const { targetUser, room, user } = data;
      await this.roomService.muteUser(user.id, targetUser.id, room.id);
      room.users.forEach(async (element) => {
        this.gateway.chatNamespace
          .to(element.socketId)
          .emit('userMuted', targetUser.nickname);
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
