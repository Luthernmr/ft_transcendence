import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessageService {
  private logger: Logger;

  constructor(
    @InjectRepository(Message) private roomRepo: Repository<Message>,
    private readonly authService: AuthService,
  ) {
    this.logger = new Logger(MessageService.name);
  }

  async createMessage(payload: any) {
    this.logger.log(payload)
  }
}
