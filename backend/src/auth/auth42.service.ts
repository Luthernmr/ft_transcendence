/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class Auth42Service {
	constructor(
		private readonly userService: UserService,
		private jwtService: JwtService,

	) { }

	async login(request: any): Promise<any> {
		//console.log(request)
		var user: User = await this.userService.getUser(request.user._json.email);
		if (!user) {
			user = await this.userService.create({
				nickname: request.user._json.login,
				email: request.user._json.email,
				imgPdp: request.user._json.image.link,
				isOnline: false
			});
		}
		await this.userService.setOnline(user);
		const payload = { id: user.id, nickname: user.nickname, email: user.email, isOnline: user.isOnline };
		const jwt = await this.jwtService.signAsync(payload);
		return jwt;
	}
}
