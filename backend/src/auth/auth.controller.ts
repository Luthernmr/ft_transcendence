/*
https://docs.nestjs.com/controllers#controllers
*/

import {
	Controller, Get, Res, Req, Post, Delete, Put, Body, BadRequestException,
	UseGuards, UsePipes, ValidationPipe, UploadedFile, UseInterceptors, UnauthorizedException
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response, Request, request, response } from 'express';
import { JwtService } from '@nestjs/jwt'
import { UserService } from 'src/user/user.service';
import { LoginDto, RegisterDto } from 'src/user/user.dto';
import { AuthService } from 'src/auth/auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { auth42Guard } from './auth42.guard';
import { Auth42Service } from './auth42.service';
import { PendingRequest } from 'src/social/pendingRequest.entity';
import { TwoFAService } from './twofa.service';
import { AuthGuard } from './auth.guard';


@Controller('api')
export class AuthController {
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,
		private readonly twoFAService: TwoFAService,
	) { }
	@Post('register')
	async register(
		@Body() registerDto: RegisterDto
	) {
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(registerDto.password, salt);

		const user = await this.userService.create({
			nickname : registerDto.nickname,
			email  : registerDto.email,
			password: hashedPassword,
			pendingRequests: []
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
		try {

			const user = await this.userService.getUser(loginDto.email);

			if (!user) {
				throw new BadRequestException('invalid credentials or not register');
			}
			if (!await bcrypt.compare(loginDto.password, user.password)) {
				throw new BadRequestException('bad password');
			}
			if (!user.isTwoFA)
				return (await this.authService.login(user, response));
		}
		catch (error) {
			console.log(error)
			return(error)
		}
	}

	@Get('user')
	@UseGuards(AuthGuard)
	async user(@Req() request: Request,
		@Res() response: Response) {
		try {
			const user = await this.authService.getUserCookie(request);
			if (!user)
				return ("no user");
			const { password, twoFASecret, ...result } = user;
			return response.send({ user: result });
		}
		catch (e) {
			return {
				message: "unauthorized"
			}
		}
	}

	@Get('logout')
	@UseGuards(AuthGuard)
	async logout(@Res({ passthrough: true }) response: Response, @Req() request: Request) {
		return this.authService.logout(request, response);
	}

	@Get('isOnline')
	@UseGuards(AuthGuard)
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
	@UseGuards(AuthGuard)
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
	@UseGuards(AuthGuard)
	@UseInterceptors(FileInterceptor('file'))
	uploadFile(@UploadedFile() file: Express.Multer.File) {
		console.log(file);
	}

	/* -------------------------------------------------------------------------- */
	/*                                     2FA                                    */
	/* -------------------------------------------------------------------------- */

	@Get('generate')
	@UseGuards(AuthGuard)
	async qrcode(@Req() request: Request, @Res() response: Response) {
		const user = await this.authService.getUserCookie(request);
		console.log("0", user);
		const { otpauthUrl } = await this.twoFAService.generateTwoFASecret(user);
		console.log(otpauthUrl)
		console.log("1", await this.authService.getUserCookie(request));

		response.setHeader('Content-Type', 'image/png');
		response.setHeader('Content-Disposition', 'attachment; filename="qrcode.png"');
		return await this.twoFAService.pipeQrCodeStream(response, otpauthUrl);
	}

	@Post('turn-on')
	@UseGuards(AuthGuard)
	async turnOnTwoFA(
		@Req() request: Request,
		@Body('twoFACode') twoFACode: string
	) {
		const user = await this.authService.getUserCookie(request);

		console.log('twofacode', twoFACode)
		console.log('userturnningon', user)
		const isCodeValid = await this.twoFAService.isTwoFACodeValid(
			twoFACode, user
		);
		console.log('isvalidecode', isCodeValid)
		try {
			if (!isCodeValid) {
				throw new UnauthorizedException('Wrong authentication code');
			}
			return await this.userService.turnOnTwoFA(user.id);
		}
		catch (error) {
			console.log(error) 
		return error
		}
	}

	@Post('turn-off')
	@UseGuards(AuthGuard)
	async turnOffTwoFA(
		@Req() request: Request,
	) {
		const user = await this.authService.getUserCookie(request);

		await this.userService.turnOffTwoFA(user.id);
	}

	@Post('2fa')
	async authenticate(
		@Res() response: Response,
		@Body('twoFACode') twoFACode: string,
		@Body('email') email: string
	) {
		try {
			const user = await this.userService.getUser(email);
			if (!user)
				throw new UnauthorizedException('user not here');
			const isCodeValid = this.twoFAService.isTwoFACodeValid(twoFACode, user);
			if (!isCodeValid) {
				throw new UnauthorizedException('Wrong authentication code');
			}
			console.log('yess')
			return (await this.authService.login(user, response));
		}
		catch (error) {
			console.log(error)
		}
	}
}
