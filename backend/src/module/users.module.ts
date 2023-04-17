import { UsersService } from './../services/users.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { UserEntity } from 'src/entities/users.entity';

@Module({
	imports: [],
	controllers: [],
	providers: [
	UsersService,],
})
export class UsersModule { }
