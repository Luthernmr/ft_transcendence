/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private jwtService: JwtService,

	) { }
	async login(user: User, response : Response): Promise<any> {
		this.userService.setOnline(user);
		const payload = { id: user.id, nickname: user.nickname, email: user.email, isOnline: user.isOnline };
		const jwt = await this.jwtService.signAsync(payload);
		response.cookie('jwt', jwt, { httpOnly: true });
	}
	
	async getUserCookie(request : Request): Promise<User>
	{
		const cookie = request.cookies['jwt'];
		const data = await this.jwtService.verifyAsync(cookie);
		return this.userService.getUser(data.email);
	}

	async logout(request: Request, response : Response)
	{
		const user = await this.getUserCookie(request);

		this.userService.setOffline(user)
		return response.clearCookie('jwt');
	}
}
