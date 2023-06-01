/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Res, Req, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { auth42Guard } from './auth42.guard';
import { Auth42Service } from './auth42.service';


@Controller('auth')
export class Auth42Controller {
	constructor(
		private readonly auth42Service: Auth42Service,
	) { }

	@Get('42')
	@UseGuards(auth42Guard)
	async login42(
		@Res({ passthrough: true }) response: Response,
		@Req() request: any
	) {
		console.log(request)
		let token = await this.auth42Service.login(request);
		response.cookie('jwt', token, { httpOnly: true });
		return ({ jwt : token});
	}
}
