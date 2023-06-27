/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Post, Body, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request, request, response } from 'express';
import { UserService } from 'src/user/user.service';
import { FriendService } from './friend.service';
import { AuthService } from 'src/auth/auth.service';
import JwtTwoFactorGuard from 'src/auth/twofa.guard';

@Controller('social')
export class FriendController {
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,
		private readonly friendService: FriendService,
	) { }

	@Post('addfriend')
	async addFriend(
		@Body('id') id : number
	){
		this.friendService.addFriend(id);
	}
	@Get('allRequest')
	@UseGuards(JwtTwoFactorGuard)
	async allRequest(
		@Req() request: Request,
		@Res() response : Response
	){
		const user = await this.authService.getUserCookie(request);
		response.send(await this.userService.getAllPendingRequest(user));
	}
}
