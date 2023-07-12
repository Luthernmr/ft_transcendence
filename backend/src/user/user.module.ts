import { UserController } from '../user/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Module } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PendingRequest } from 'src/social/pendingRequest.entity';
import { BlockedUser } from 'src/social/blockedUser.entity';
import { HistoryService } from 'src/pong/history.service';
import { PongHistory } from 'src/pong/pongHistory.entity';
import { GlobalGateway } from 'src/websockets/global.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([PendingRequest]),
    TypeOrmModule.forFeature([BlockedUser]),
    TypeOrmModule.forFeature([PongHistory]),
  ],
  controllers: [UserController],
  providers: [UserService, HistoryService, GlobalGateway],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
