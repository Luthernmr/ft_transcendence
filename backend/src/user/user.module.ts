import { UserController } from './user.controller';

/*
https://docs.nestjs.com/modules
*/
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity'
import { Module } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthModule } from '../auth/auth.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	controllers: [UserController,],
	providers: [UserService],
	exports: [TypeOrmModule, UserService]
})
export class UserModule { }
