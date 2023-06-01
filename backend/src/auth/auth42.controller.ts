/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Res, Req, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { auth42Guard } from './auth42.guard';
import { Auth42Service } from './auth42.service';
import axios from "axios";


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
		const ret = await axios.get('https://api.intra.42.fr/v2/me', {
			headers: {
			  Authorization: "Bearer " + request.user.access_token,
			},
		})
		console.log(request)
		let token = await this.auth42Service.login(request.user);
		 response.cookie('jwt', token, { httpOnly: true });
	
		response.redirect('http://212.227.209.204:3000/home');
		return ({ jwt : token});
	}
}
