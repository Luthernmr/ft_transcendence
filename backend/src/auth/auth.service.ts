/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { authenticator } from 'otplib';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private jwtService: JwtService,

	) { }
	async login(user: User, response: Response): Promise<any> {
		await this.userService.setOnline(user);
		const payload = { id: user.id, nickname: user.nickname, email: user.email, isOnline: user.isOnline, isTwoFa: user.isTwoFA };
		const jwt = await this.jwtService.signAsync(payload);
		response.cookie('jwt', jwt, { httpOnly: true });
		return({ token: jwt });
	}

	async loginTwoFa(user : User, response : Response, isSecondFactorAuthenticated = false)
	{
		await this.userService.setOnline(user);
		const payload = { id: user.id,  isSecondFactorAuthenticated};
		const twofaToken = await this.jwtService.signAsync(payload);
		response.cookie('twofa', twofaToken, { httpOnly: true });
	}

	async setCookie(user: User, response: Response)
	{
		const payload = { id: user.id, nickname: user.nickname, email: user.email, isOnline: user.isOnline };
		const jwt = await this.jwtService.signAsync(payload);
		response.cookie('jwt', jwt, { httpOnly: true });
	}

	async getUserCookie(request: Request): Promise<User> {
		const cookie = request.cookies['jwt'];
		const data = await this.jwtService.verifyAsync(cookie);
		return await this.userService.getUser(data.email);
	}

	async getUserByToken(token: any): Promise<User> {
		if (token) {
			const data = await this.jwtService.verifyAsync(token);
			const user: User = await this.userService.getUser(data.email);
			delete user?.password

			return user;
		}

	}

	async logout(request: Request, response: Response) {
		const user = await this.getUserCookie(request);

		await this.userService.setOffline(user)
		response.clearCookie('jwt');
		response.clearCookie('twofa');
		console.log('prout', response.cookie['jwt']);

	}

}
