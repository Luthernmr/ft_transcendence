
/*
https://docs.nestjs.com/modules
*/
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../Entities/user.entity'
import { Module } from '@nestjs/common';
import { UserService } from 'src/Services/user.service';
import { AuthModule } from './auth.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/Services/auth.service';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	controllers:  [],
	providers: [UserService],
	exports: [TypeOrmModule, UserService]
})
export class UserModule { }
