/*
https://docs.nestjs.com/controllers#controllers
*/
import { Request, Response } from 'express';
import { Controller, Get, Req, Res } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from './user.service';

@Controller('user')
export class UserController { 
	constructor (
		private readonly userService : UserService
	) {}

	@Get('all')
	async all(@Res() response: Response)
	{
		const users = await this.userService.getAllUser();
		const allUsers = { users : users}
		response.send(allUsers);
	}
}
