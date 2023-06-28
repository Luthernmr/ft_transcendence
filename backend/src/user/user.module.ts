import { UserController } from '../user/user.controller';

/*
https://docs.nestjs.com/modules
*/
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity'
import { Module } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PendingRequest } from 'src/social/pendingRequest.entity';
import { FriendModule } from 'src/social/friend.module';
import { BlockedUser } from 'src/social/blockedUser.entity';
import { AuthService } from 'src/auth/auth.service';
import { HistoryService } from 'src/pong/history.service';
import { PongHistory } from 'src/pong/pongHistory.entity';

@Module({
	imports: [TypeOrmModule.forFeature([User]),  TypeOrmModule.forFeature([PendingRequest]), TypeOrmModule.forFeature([BlockedUser]), TypeOrmModule.forFeature([PongHistory])],
	controllers: [UserController,],
	providers: [UserService,HistoryService],
	exports: [TypeOrmModule, UserService, ]
})
export class UserModule { }
