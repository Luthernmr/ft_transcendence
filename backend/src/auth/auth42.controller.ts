import { Controller, Get, Res, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { auth42Guard } from './auth42.guard';
import { Auth42Service } from './auth42.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class Auth42Controller {
	constructor(
		private readonly auth42Service: Auth42Service,
		private authService: AuthService,
	) { }

	@Get('42')
	@UseGuards(auth42Guard)
	async login42(
		@Res({ passthrough: true }) response: Response,
		@Req() request: any,
	) {
		try {
			if (request.cookies['jwt']) {
				throw new BadRequestException('Already connected in other window');
			}
			let token = await this.auth42Service.login(request.user);
			const user = await this.authService.getUserByToken(token);
			if (user) {
				await this.authService.loginTwoFa(user, response, true);
				response.cookie('jwt', token, { httpOnly: true });
				if (!user.isTwoFA)
					return { jwt: token};
			}
			return;
		} catch (error) {
			return error
		}
	}
}
