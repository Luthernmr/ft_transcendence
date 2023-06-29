/*
https://docs.nestjs.com/controllers#controllers
*/
import { Request, Response } from 'express';
import { Body, Controller, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from './user.service';
import JwtTwoFactorGuard from 'src/auth/twofa.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './user.entity';
import { diskStorage } from 'multer';
import { HistoryService } from 'src/pong/history.service';
import { request } from 'http';

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private historyService: HistoryService
	) { }

	@Get('all')
	@UseGuards(JwtTwoFactorGuard)
	async all(@Res() response: Response) {
		const users = await this.userService.getAllUser();
		const allUsers = { users: users }
		response.send(allUsers);
	}

	@Get(':id')
	@UseGuards(JwtTwoFactorGuard)
	async user(@Res() response: Response, @Param('id') id: number) {
		console.log('here')
		const user = await this.userService.getUserById(id)
		delete user.password;
		console.log('test', user)
		response.send({ user: user });
	}

	@Get('history/:id')
	@UseGuards()
	async history(@Res() response: Response, @Param('id') id: number) {
		try {
			console.log('pitch',id);

			const user : any = await this.userService.getUserById(id)
			delete user.password;
			const history : any = await this.historyService.getUserHistory(user);
			console.log('history', history[0]);
			response.send({history : history[0]});
		} catch (error) {
			console.log(error);
		}
	}

	@Post('settings')
	@UseGuards(JwtTwoFactorGuard)
	async settings(
		@Body('img') img: string,
		@Body('nickname') nickname: string,
		@Res({ passthrough: true }) response: Response,
		@Req() request: Request
	) {
		const user: any = request.user;
		if (!user)
			return ("no user");
		this.userService.changeImg(user, img);
		this.userService.changeNickname(user, nickname);
		return response.send({ img, user });
	}

	@Post('avatar')
	@UseGuards(JwtTwoFactorGuard)
	@UseInterceptors(FileInterceptor('file', {
		storage: diskStorage({
			destination: './uploadedFiles/avatars'
		})
	}))
	async addAvatar(@Req() request: Request, @UploadedFile() file: Express.Multer.File) {
		
	}
}
