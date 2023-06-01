/*
https://docs.nestjs.com/modules
*/
import { JwtModule, JwtService } from '@nestjs/jwt';

import { Module } from '@nestjs/common';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserModule } from '../user/user.module';
import { UserService } from 'src/user/user.service';
import { auth42Strategy } from './auth42.strategy';
import { Auth42Service } from './auth42.service';
import { Auth42Controller } from './auth42.controller';

@Module({
	imports: [JwtModule.register({secret: 'secret', signOptions: { expiresIn: '999d' }}), UserModule],
	controllers: [AuthController, Auth42Controller],
	providers: [auth42Strategy, AuthService, Auth42Service],
	exports : [AuthService,  Auth42Service]
})
export class AuthModule { }
