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
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RoomService {
  private logger: Logger;

  constructor(
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    private readonly authService: AuthService,
    private readonly userService: UserService,
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
        throw new BadRequestException('Room already exists');
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
        users: dto.users,
      };
      await this.roomRepo.save(payload);
    } catch (error) {
      this.logger.log(error);
      throw error;
    }
  }

  async getAllAccessibleRooms(userId: number): Promise<Room[]> {
    const publicRooms = await this.roomRepo.find({
      where: { isPrivate: false },
      relations: ['users'],
    });
    const privateUserRooms = await this.roomRepo
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.users', 'user')
      .where('room.isPrivate = :isPrivate', { isPrivate: true })
      .getMany()
      .then((rooms) =>
        rooms.filter((room) => room.users.some((user) => user.id === userId)),
      );

    return [...publicRooms, ...privateUserRooms];
  }

  async deleteRoom(roomId: number) {
    await this.roomRepo.delete({ id: roomId });
  }

  async addUserToRoom(userId: number, payload: Room) {
    const room = await this.roomRepo.findOne({
      where: { id: payload.id },
      relations: ['users'],
    });
  
    if (!room) {
      throw new BadRequestException('Room does not exist');
    }
  
    const userAlreadyInRoom = room.users.some((user) => user.id === userId);
  
    if (!userAlreadyInRoom) {
      const user = await this.userService.getUserById(userId);
  
      if (!user) {
        throw new BadRequestException('User does not exist');
      }
  
      room.users.push(user);
      await this.roomRepo.save(room);
    }
  
    return room;
  }
}
