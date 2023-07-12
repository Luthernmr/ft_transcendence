import {
  BadRequestException,
  Injectable,
  Logger,
  ValidationError,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { CreateMessageDto } from './dto/create-message.dto';
import { UserService } from 'src/user/user.service';
import { RoomService } from 'src/room/room.service';
import { User } from 'src/user/user.entity';
import { Room } from 'src/room/entities/room.entity';

@Injectable()
export class MessageService {
  private logger: Logger;

  constructor(
    private readonly roomService: RoomService,
    private readonly userService: UserService,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Room) private roomRepo: Repository<Room>,
  ) {
    this.logger = new Logger(MessageService.name);
  }

  async createMessage(data: Message) {
    try {
      const dto = plainToClass(CreateMessageDto, data);
      await validateOrReject(dto).catch((errors: ValidationError[]) => {
        throw new BadRequestException(errors);
      });

      const user = await this.userRepo.findOne({where: {id: data.user.id}});
      const room = await this.roomRepo.findOne({where: {id: data.room.id}});

      if (!user || !room) {
        throw new BadRequestException('User or Room does not exist');
      }

      const message = new Message();
      message.text = dto.text;
      message.user = data.user;
      message.room = data.room;

      return await this.messageRepo.save(message);
    } catch (error) {
      throw error;
    }
  }

  async getMessagesByRoom(roomName: string): Promise<Message[]> {
    try {
      const room = await this.roomRepo.findOne({
        where: { name: roomName },
        relations: ['messages', 'messages.user'],
      });
      if (!room) {
        throw new Error('Room not found');
      }
      return room.messages;
    } catch (error) {
      this.logger.log(error);
      throw error;
    }
  }
}
