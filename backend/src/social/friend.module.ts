import { UserModule } from 'src/user/user.module';
import { FriendService } from './friend.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from './friend.entity';
import { PendingRequest } from './pendingRequest.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Friend]), UserModule,],
	controllers: [FriendController],
	providers: [FriendService],
})
export class FriendModule { }
