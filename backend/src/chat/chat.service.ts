import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { Room } from 'src/room/entities/room.entity';
import { FriendService } from 'src/social/friend.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
export class ChatService {
  private logger: Logger;

  constructor(@InjectRepository(Room) private repo: Repository<Room>,
  private readonly userService: UserService,
  private readonly authService: AuthService,
  private readonly friendService: FriendService,) {
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
    ) {
    try {
      const room = await this.repo.findOne({ where: { name: data.name } });
      const user = await this.authService.getUserByToken(client.handshake.auth.token);
      if (room) {
        throw new BadRequestException('Room already exist');
      }
      const prout = {
        name: data.name,
        ownerId: user.id,
      }
        await this.repo.save(prout);
    } catch (error) {
      this.logger.log(error);
      client.emit('roomAlreadyExist');
    }
  }
}
