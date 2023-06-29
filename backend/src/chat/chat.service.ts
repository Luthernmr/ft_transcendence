import { Injectable, Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from 'src/room/room.service';
import { Room } from 'src/room/entities/room.entity';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
export class ChatService {
  private logger: Logger;

  constructor(private readonly roomService: RoomService) {
    this.logger = new Logger(ChatService.name);
  }

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.logger.log('Gateway initialized');
  }

  handleConnection(socket: Socket) {
    this.logger.log('id: ' + socket.id + ' connected');
  }

  handleDisconnect(socket: Socket) {
    this.logger.log('id: ' + socket.id + ' disconnected');
  }

  @SubscribeMessage('createRoom')
  async createRoom(client: Socket, data: Partial<Room>) {
    const error = await this.roomService.createRoom(client, data);
    if (error) {
      client.emit('error', { message: error.message });
    } else {
      client.emit('roomCreated');
    }
  }

  @SubscribeMessage('getUserGroups')
  async getUserGroups(client: Socket, payload: { userId: number }) {
    const rooms = await this.roomService.getAllRoomsForUser(payload.userId);
    client.emit('roomList', rooms);
  }
}
