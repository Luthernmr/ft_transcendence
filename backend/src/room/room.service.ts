import {
  BadRequestException,
  Injectable,
  Logger,
  ValidationError,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Room } from 'src/room/entities/room.entity';
import { Repository } from 'typeorm';
import { Socket } from 'socket.io';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomService {
  private logger: Logger;

  constructor(
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    private readonly authService: AuthService,
  ) {
    this.logger = new Logger(RoomService.name);
  }

  async createRoom(client: Socket, data: Partial<Room>) {
    try {
      const dto = plainToClass(CreateRoomDto, data);
      await validateOrReject(dto).catch((errors: ValidationError[]) => {
        throw new BadRequestException(errors);
      });

      const room = await this.roomRepo.findOne({ where: { name: dto.name } });
      const user = await this.authService.getUserByToken(
        client.handshake.auth.token,
      );
      if (room) {
        throw new BadRequestException('Room already exist');
      }
      let hashedPassword = null;
      if (dto.password) {
        const salt = await bcrypt.genSalt();
        hashedPassword = await bcrypt.hash(dto.password, salt);
      }
      const payload = {
        name: dto.name,
        ownerId: user.id,
        isPrivate: dto.isPrivate,
        password: hashedPassword,
        users: [user],
      };
      await this.roomRepo.save(payload);
    } catch (error) {
      this.logger.log(error);
      return error;
    }
  }

  async getAllRoomsForUser(userId: number): Promise<Room[]> {
    return await this.roomRepo
      .createQueryBuilder('room')
      .innerJoin('room.users', 'user', 'user.id = :userId', { userId })
      .getMany();
  }
}