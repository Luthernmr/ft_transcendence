/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Controller('social')
export class FriendController {
	constructor(
		private readonly userService: UserService,
	) { }

	@Post('addfriend')
	async addFriend(
		@Body('id') id : number
	){
		this.addFriend(id);
	}
	@Get('allRequest')
	async allRequest(
		@Body()
	)
}
