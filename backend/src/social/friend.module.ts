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
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [TypeOrmModule.forFeature([Friend]), UserModule, AuthModule],
	controllers: [FriendController],
	providers: [FriendService],
	exports: [FriendService],
})
export class FriendModule { }
