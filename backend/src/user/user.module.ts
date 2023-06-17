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

@Module({
	imports: [TypeOrmModule.forFeature([User]),  TypeOrmModule.forFeature([PendingRequest]), TypeOrmModule.forFeature([BlockedUser])],
	controllers: [UserController,],
	providers: [UserService],
	exports: [TypeOrmModule, UserService]
})
export class UserModule { }
