import { BadRequestException, Injectable, Logger, ValidationError } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { CreateMessageDto } from './dto/create-message.dto';
import { UserService } from 'src/user/user.service';
import { RoomService } from 'src/room/room.service';

@Injectable()
export class MessageService {
  private logger: Logger;

  constructor(
    private readonly roomService: RoomService,
    private readonly userService: UserService,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
  ) {
    this.logger = new Logger(MessageService.name);
  }
  
  async createMessage(data: Message) {
    try {
      const dto = plainToClass(CreateMessageDto, data);
      await validateOrReject(dto).catch((errors: ValidationError[]) => {
        throw new BadRequestException(errors);
      });      
  
      // const user = await this.userService.findOne(dto.userId);
      // const room = await this.roomService.findOne(dto.roomId);
  
      // if (!user || !room) {
      //   throw new BadRequestException('User or Room does not exist');
      // }
  
      const message = new Message();
      message.text = dto.text;
      message.user = data.user; //replace after user check
      message.room = data.room;
  
      await this.messageRepo.save(message);
    } catch (error) {
      throw error;
    }    
  }
}
