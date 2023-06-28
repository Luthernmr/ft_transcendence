import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Room } from 'src/room/entities/room.entity';
import { Repository } from 'typeorm';
import { Socket } from 'socket.io';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RoomService {
  private logger: Logger;

  constructor(
    @InjectRepository(Room) private repo: Repository<Room>,
    private readonly authService: AuthService,
  ) {
    this.logger = new Logger(RoomService.name);
  }

  async createRoom(client: Socket, data: Partial<Room>) {
    this.logger.log('Received name: ' + data.name); //To delete (Debug)
    this.logger.log('Received isPrivate: ' + data.isPrivate); //To delete (Debug)
    this.logger.log('Received password: ' + data.password); //To delete (Debug)
    this.logger.log('Received users: ' + data.users); //To delete (Debug)
    try {
      const room = await this.repo.findOne({ where: { name: data.name } });
      const user = await this.authService.getUserByToken(
        client.handshake.auth.token,
      );
      if (room) {
        throw new BadRequestException('Room already exist');
      }
      let hashedPassword = null;
      if (data.password){
        const salt = await bcrypt.genSalt();
        hashedPassword = await bcrypt.hash(data.password, salt);
      }
      const payload = {
        name: data.name,
        ownerId: user.id,
        isPrivate: data.isPrivate,
        password: hashedPassword,
        users: [user],
      };
      await this.repo.save(payload);
    } catch (error) {
      this.logger.log(error);
      return error;
    }
  }
}
