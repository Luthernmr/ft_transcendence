import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Room } from 'src/room/entities/room.entity';
import { Repository } from 'typeorm';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
export class ChatService {
  private logger: Logger;

  constructor(@InjectRepository(Room) private repo: Repository<Room>) {
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
  async createRoom(
    client: Socket,
    data: Partial<Room>,
    ): Promise<Room> {
    console.log(data);
    try {
      const room = await this.repo.findOne({ where: { name: data.name } });
      if (room) {
        throw new BadRequestException('Room already exist');
      }
      // Object.assign(room, data.name);
      return this.repo.save(data);
    } catch (error) {
      this.logger.log(error);
      client.emit('roomAlreadyExist');
    }
  }
}
