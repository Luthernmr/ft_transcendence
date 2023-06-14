/*
https://docs.nestjs.com/controllers#controllers
*/

import {
	Controller, Get, Res, Req, Post, Delete, Put, Body, BadRequestException,
	UseGuards, UsePipes, ValidationPipe, UploadedFile, UseInterceptors
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response, Request, request, response } from 'express';
import { JwtService } from '@nestjs/jwt'
import { UserService } from 'src/user/user.service';
import { LoginDto } from 'src/user/user.dto';
import { AuthService } from 'src/auth/auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { auth42Guard } from './auth42.guard';
import { Auth42Service } from './auth42.service';
import { PendingRequest } from 'src/social/pendingRequest.entity';


@Controller('api')
export class AuthController {
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,
	) { }
	@Post('register')
	async register(
		@Body('nickname') nickname: string,
		@Body('email') email: string,
		@Body('password') password: string,
		@Body('img') img: string
	) {
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = await this.userService.create({
			nickname,
			email,
			password: hashedPassword,
			img: img,
			pendingRequests : []
		});
		delete user.password
		return user;
	}

	@Post('login')
	@UsePipes(new ValidationPipe())
	async login(
		@Body() loginDto: LoginDto,
		@Res({ passthrough: true }) response: Response
	) {
		const user = await this.userService.getUser(loginDto.email);
		if (!user) {
			throw new BadRequestException('invalid credentials');
		}
		if (!await bcrypt.compare(loginDto.password, user.password)) {
			throw new BadRequestException('bad password');
		}

		return (await this.authService.login(user, response));
	}

	@Get('user')
	async user(@Req() request: Request,
	@Res() response : Response) {
		try {
			const user = await this.authService.getUserCookie(request);
			if (!user)
				return ("no user");
			const { password, ...result } = user;
			return response.send({user : result});
		}
		catch (e) {
			return {
				message: "unauthorized"
			}
		}
	}

	@Get('logout')
	async logout(@Res({ passthrough: true }) response: Response, @Req() request: Request) {
		return this.authService.logout(request, response);
	}

	@Get('isOnline')
	async isOnline(@Req() request: Request, @Res() response: Response) {
		try {
			const user = await this.authService.getUserCookie(request);
			if (!user.isOnline) {
				return response.send({ online: false });
			} else {
				return response.send({ online: true });
			}
		} catch (error) {
			console.error(error);
			return response.send({ message: "no cookie set", online: false });
		}
	}

	@Post('settings')
	async settings(
		@Body('img') img: string,
		@Body('nickname') nickname: string,
		@Res({ passthrough: true }) response: Response,
		@Req() request: Request
	) {
		const user = await this.authService.getUserCookie(request);
		if (!user)
			return ("no user");
		this.userService.changeImg(user, img);
		this.userService.changeNickname(user, nickname);
		return response.send({ img, user });
	}
	@Post('upload')
	@UseInterceptors(FileInterceptor('file'))
	uploadFile(@UploadedFile() file: Express.Multer.File) {
		console.log(file);
	}
}
