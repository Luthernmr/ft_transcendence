/*
https://docs.nestjs.com/modules
*/
import { JwtModule } from '@nestjs/jwt';

import { Module } from '@nestjs/common';
import { AuthController } from 'src/Controller/auth.controller';
import { AuthService } from 'src/Services/auth.service';
import { UserModule } from './user.module';
import { UserService } from 'src/Services/user.service';

@Module({
	imports: 
	[
		UserModule,
		JwtModule.register({secret: 'secret', signOptions: { expiresIn: '999d' }})
	],
	controllers: [AuthController],
	providers: [UserService],
})
export class AuthModule { }
