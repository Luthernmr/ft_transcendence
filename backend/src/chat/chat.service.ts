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
    this.logger.log('id: ' + client.id + ' connected');
    let user: User = await this.authService.getUserByToken(
      client.handshake.auth.token,
    );
    if (user) {
      user = await this.userService.setSocket(user.id, client.id);
      await this.userService.setOnline(user);
    }
  }

  @SubscribeMessage('createRoom')
  async createRoom(client: Socket, data: Partial<Room>) {
    try {
      await this.roomService.createRoom(client, data);
      data.users.forEach(async (element) => {
        const rooms = await this.userService.getRoomsByUID(element.id);
        this.gateway.chatNamespace
          .to(element.socketId)
          .emit('roomList', rooms.rooms);
      });
      this.gateway.chatNamespace.emit('roomCreated');
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('getUserRooms')
  async getUserRooms(client: Socket, payload: { userId: number }) {
    const rooms = await this.roomService.getAllAccessibleRooms(payload.userId);
    client.emit('roomList', rooms);
  }

  @SubscribeMessage('checkRoomPassword')
  async checkRoomPass(
    client: Socket,
    payload: { room: Room; password: string },
  ) {
    const answer = await bcrypt.compare(
      payload.password,
      payload.room.password,
    );
    client.emit('passCheck', answer);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(client: Socket, data: Message) {
    try {
      const message = await this.messageService.createMessage(data);
      data.room.users.forEach(async (element) => {
        const otherSocket = await this.authService.getUserSocket(
          this.gateway.chatNamespace,
          element.id,
        );
        if (otherSocket) otherSocket.emit('receiveMessage', message);
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
}
