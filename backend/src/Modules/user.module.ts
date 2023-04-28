/*
https://docs.nestjs.com/modules
*/
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../Entities/user.entity'
import { Module } from '@nestjs/common';
import { UserService } from 'src/Services/user.service';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	controllers: [],
	providers: [UserService],
	exports: [TypeOrmModule]
})
export class UserModule { }
