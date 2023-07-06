import { Injectable, Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from 'src/room/room.service';
import { Room } from 'src/room/entities/room.entity';
import { UserService } from 'src/user/user.service';
import { MessageService } from 'src/message/message.service';
import { User } from 'src/user/user.entity';
import { AuthService } from 'src/auth/auth.service';
import * as bcrypt from 'bcrypt';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
export class ChatService {
  private logger: Logger;

  constructor(
    private readonly roomService: RoomService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
  ) {
    this.logger = new Logger(ChatService.name);
  }

  @WebSocketServer()
  server: Server;

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
    const error = await this.roomService.createRoom(client, data);
    if (error) {
      this.server.emit('error', { message: error.message });
    } else {
      this.server.emit('roomCreated');
      data.users.forEach(async (element) => {
        const rooms = await this.userService.getRoomsByUID(element.id);
        this.server.to(element.socketId).emit('roomList', rooms.rooms);
      });
    }
  }

  @SubscribeMessage('getUserRooms')
  async getUserRooms(payload: { userId: number }) {
    const rooms = await this.userService.getRoomsByUID(payload.userId);
    this.server.emit('roomList', rooms.rooms);
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
  async sendMessage(
    client: Socket,
    payload: { content: string; roomId: number; userId: number },
  ) {
    const message = await this.messageService.createMessage(payload);
    this.server.to(payload.roomId.toString()).emit('newMessage', message);
  }
}
