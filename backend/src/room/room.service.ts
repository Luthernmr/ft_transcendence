import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  ValidationError,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Room } from 'src/room/entities/room.entity';
import { MoreThan, Repository } from 'typeorm';
import { Socket } from 'socket.io';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { CreateRoomDto } from './dto/create-room.dto';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { Mute } from './entities/muted-user.entity';

@Injectable()
export class RoomService {
  private logger: Logger;

  constructor(
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    @InjectRepository(Mute) private muteRepo: Repository<Mute>,
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
        client.emit('roomAlreadyExists', room);
        throw new BadRequestException('Room already exists');
      }
      let hashedPassword = null;
      if (dto.password) {
        const salt = await bcrypt.genSalt();
        hashedPassword = await bcrypt.hash(dto.password, salt);
      }
      let payload = {
        name: dto.name,
        ownerId: user.id,
        isPrivate: dto.isPrivate,
        isDm : dto.isDm,
        password: hashedPassword,
        users: dto.users,
      };
      const savedRoom = await this.roomRepo.save(payload);
      return savedRoom;
    } catch (error) {
      this.logger.log(error);
      throw error;
    }
  }

  async getAllAccessibleRooms(userId: number): Promise<Room[]> {
    const publicRooms = await this.roomRepo.find({
      where: { isPrivate: false },
      relations: ['users', 'admins', 'bannedUsers'],
    });
    const privateUserRooms = await this.roomRepo
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.users', 'user')
      .leftJoinAndSelect('room.admins', 'admin')
      .where('room.isPrivate = :isPrivate', { isPrivate: true })
      .getMany()
      .then((rooms) =>
        rooms.filter((room) => room.users.some((user) => user.id === userId)),
      );

    return [...publicRooms, ...privateUserRooms];
  }

  async getDirectRoom(userId1: number, userId2: number): Promise<Room> | null {
    const dmRooms = await this.roomRepo.find({
      where: { isDm: true },
      relations: ['users'],
    });
    for (let room of dmRooms) {
      if (
        room.users.some((user) => user.id === userId1) &&
        room.users.some((user) => user.id === userId2)
      ) {
        return room;
      }
    }
    return null;
  }

  async deleteRoom(roomId: number) {
    await this.roomRepo.delete({ id: roomId });
  }

  async addUserToRoom(userId: number, payload: Room) {
    const room = await this.roomRepo.findOne({
      where: { id: payload.id },
      relations: ['users', 'admins', 'bannedUsers'],
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

  async leaveRoom(
    userId: number,
    payload: { roomId: number; newOwnerId?: number },
  ) {
    const room = await this.roomRepo.findOne({
      where: { id: payload.roomId },
      relations: ['users', 'admins', 'bannedUsers'],
    });

    if (!room) {
      throw new BadRequestException('Room does not exist');
    }

    if (room.ownerId === userId) {
      if (!payload.newOwnerId) {
        throw new BadRequestException('New owner must be specified');
      }

      const newOwner = room.users.find(
        (user) => user.id === payload.newOwnerId,
      );

      if (!newOwner) {
        throw new BadRequestException('New owner does not exist');
      }

      room.ownerId = newOwner.id;
    }

    room.users = room.users.filter((user) => user.id !== userId);
    room.admins = room.admins.filter((user) => user.id !== userId);
    await this.roomRepo.save(room);

    return room;
  }

  async updateRoomPassword(
    userId: number,
    payload: { roomId: number; password: string },
  ) {
    const room = await this.roomRepo.findOne({
      where: { id: payload.roomId },
      relations: ['users'],
    });

    if (!room) {
      throw new BadRequestException('Room does not exist');
    }

    if (room.ownerId !== userId) {
      throw new BadRequestException('Only the owner can change the password');
    }

    let hashedPassword = null;
    if (payload.password) {
      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(payload.password, salt);
    }
    room.password = hashedPassword;
    await this.roomRepo.save(room);

    return room;
  }

  async updateAdmins(
    userId: number,
    payload: { roomId: number; adminList: User[] },
  ) {
    const room = await this.roomRepo.findOne({
      where: { id: payload.roomId },
      relations: ['users', 'admins', 'bannedUsers'],
    });

    if (!room) {
      throw new BadRequestException('Room does not exist');
    }

    if (room.ownerId !== userId) {
      throw new BadRequestException('Only the owner can update admins');
    }

    room.admins = payload.adminList;
    await this.roomRepo.save(room);

    return room;
  }

  async kickUser(operatorUserId: number, targetUserId: number, roomId: number) {
    const room = await this.roomRepo.findOne({
      where: { id: roomId },
      relations: ['users', 'admins', 'bannedUsers'],
    });

    if (!room) {
      throw new BadRequestException('Room does not exist');
    }

    const operatorUser = room.users.find((user) => user.id === operatorUserId);

    if (!operatorUser) {
      throw new BadRequestException(
        'Operator user does not exist in this room',
      );
    }

    if (
      room.ownerId !== operatorUserId &&
      !room.admins.some((admin) => admin.id === operatorUserId)
    ) {
      throw new BadRequestException('Only the owner or admins can kick users');
    }

    const targetUser = room.users.find((user) => user.id === targetUserId);

    if (!targetUser) {
      throw new BadRequestException('Target user does not exist in this room');
    }

    room.users = room.users.filter((user) => user.id !== targetUserId);
    await this.roomRepo.save(room);

    return room;
  }

  async banUser(operatorUserId: number, targetUserId: number, roomId: number) {
    const room = await this.roomRepo.findOne({
      where: { id: roomId },
      relations: ['users', 'admins', 'bannedUsers'],
    });

    if (!room) {
      throw new BadRequestException('Room does not exist');
    }

    const operatorUser = room.users.find((user) => user.id === operatorUserId);

    if (!operatorUser) {
      throw new BadRequestException(
        'Operator user does not exist in this room',
      );
    }

    if (
      room.ownerId !== operatorUserId &&
      !room.admins.some((admin) => admin.id === operatorUserId)
    ) {
      throw new BadRequestException('Only the owner or admins can ban users');
    }

    const targetUser = room.users.find((user) => user.id === targetUserId);

    if (!targetUser) {
      throw new BadRequestException('Target user does not exist in this room');
    }

    room.users = room.users.filter((user) => user.id !== targetUserId);
    room.bannedUsers.push(targetUser);
    await this.roomRepo.save(room);

    return room;
  }

  async muteUser(
    requestingUserId: number,
    targetUserId: number,
    roomId: number,
  ): Promise<void> {
    const room = await this.roomRepo.findOne({
      where: { id: roomId },
      relations: ['admins', 'bannedUsers'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const requestingUser = await this.userService.getUserById(requestingUserId);
    const targetUser = await this.userService.getUserById(targetUserId);

    if (!requestingUser || !targetUser) {
      throw new NotFoundException('User not found');
    }

    if (
      room.ownerId !== requestingUser.id &&
      !room.admins.some((admin) => admin.id === requestingUser.id)
    ) {
      throw new UnauthorizedException(
        'You do not have permission to mute users in this room',
      );
    }

    const existingMute = await this.muteRepo.findOne({
      where: { user: targetUser, room: room, muteEnd: MoreThan(new Date()) },
    });

    if (existingMute) {
      throw new ConflictException('User is already muted');
    }

    const mute = new Mute();
    mute.user = targetUser;
    mute.room = room;
    mute.muteEnd = new Date(Date.now() + 60 * 1000);
    await this.muteRepo.save(mute);
  }

  async isMuted(userId: number, roomId: number): Promise<boolean> {
    const currentTimestamp = new Date();

    const user = await this.userService.getUserById(userId);
    const room = await this.roomRepo.findOne({ where: { id: roomId } });

    const mute = await this.muteRepo.findOne({
      where: { user: user, room: room, muteEnd: MoreThan(currentTimestamp) },
    });

    return !!mute;
  }
}
