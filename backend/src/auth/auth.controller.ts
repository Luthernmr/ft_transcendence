import {
	Controller,
	Get,
	Res,
	Req,
	Post,
	Body,
	BadRequestException,
	UseGuards,
	UsePipes,
	ValidationPipe,
	UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response, Request } from 'express';
import { UserService } from 'src/user/user.service';
import { LoginDto, RegisterDto, twoFaCodeDto } from 'src/user/user.dto';
import { AuthService } from 'src/auth/auth.service';
import { TwoFAService } from './twofa.service';
import JwtTwoFactorGuard from './twofa.guard';
import { LocalAuthGuard } from './auth.guard';
import { User } from 'src/user/user.entity';

@Controller('api')
export class AuthController {
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,
		private readonly twoFAService: TwoFAService,
	) { }
	@Post('register')
	async register(@Body() registerDto: RegisterDto) {
		try {
			const salt = await bcrypt.genSalt();
			const hashedPassword = await bcrypt.hash(registerDto.password, salt);
			const user = await this.userService.create({
				nickname: registerDto.nickname,
				email: registerDto.email,
				password: hashedPassword,
				pendingRequests: [],
			});
			delete user.password;
			return user;
		} catch (error) { }
	}

	@Post('login')
	@UsePipes(new ValidationPipe())
	async login(
		@Body() loginDto: LoginDto,
		@Res({ passthrough: true }) response: Response,
	) {
		try {
			const user = await this.userService.getUser(loginDto.email);
			if (!user) {
				throw new BadRequestException('user not exist');
			}
			if (!(await bcrypt.compare(loginDto.password, user.password))) {
				throw new BadRequestException('wrong password');
			}
			if(user.isOnline)
				throw new BadRequestException('already connected');

			const token = await this.authService.login(user, response);
			await this.authService.loginTwoFa(user, response, false);
			if (!user.isTwoFA)
				return token;
			return;
		} catch (error) {
			
			return error;
		}
	}

	@Get('user')
	@UseGuards(JwtTwoFactorGuard)
	async user(@Req() request: Request, @Res() response: Response) {
		try {
			const user = await this.authService.getUserCookie(request);
			if (!user) return 'no user';
			const { password, twoFASecret, ...result } = user;
			return response.send({ user: result });
		} catch (e) {
			return {
				message: 'unauthorized',
			};
		}
	}

	@Get('logout')
	@UseGuards(JwtTwoFactorGuard)
	async logout(
		@Res({ passthrough: true }) response: Response,
		@Req() request: Request,
	) {
		try {
			await this.authService.logout(request, response);
		} catch (error) {

		}
	}

	@Get('isOnline')
	@UseGuards(JwtTwoFactorGuard)
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
			return response.send({ message: 'no cookie set', online: false });
		}
	}

	/* -------------------------------------------------------------------------- */
	/*                                     2FA                                    */
	/* -------------------------------------------------------------------------- */

	@Get('generate')
	@UseGuards(LocalAuthGuard)
	async qrcode(@Req() request: Request, @Res() response: Response) {
		try {

			const user: Partial<User> = await this.authService.getUserCookie(request);
			const { otpauthUrl } = await this.twoFAService.generateTwoFASecret(user);

			response.setHeader('Content-Type', 'image/png');
			response.setHeader(
				'Content-Disposition',
				'attachment; filename="qrcode.png"',
			);
			return await this.twoFAService.pipeQrCodeStream(response, otpauthUrl);
		} catch (error) {

		}
	}

	@Post('turn-on')
	@UseGuards(LocalAuthGuard)
	async turnOnTwoFA(
		@Req() request: Request,
		@Body() twoFaCodeDto: twoFaCodeDto,
	) {
		try {
			const user = await this.authService.getUserCookie(request);
			const isCodeValid = await this.twoFAService.isTwoFACodeValid(
				twoFaCodeDto.twoFaCode,
				user,
			);
			if (!isCodeValid) {
				throw new UnauthorizedException('Wrong authentication code');
			}
			return await this.userService.turnOnTwoFA(user.id);
		} catch (error) {
			return error;
		}
	}

	@Post('turn-off')
	@UseGuards(JwtTwoFactorGuard)
	async turnOffTwoFA(@Req() request: Request) {
		const user = await this.authService.getUserCookie(request);

		await this.userService.turnOffTwoFA(user.id);
	}

	@Post('2fa')
	@UseGuards(LocalAuthGuard)
	async authenticate(
		@Res() response: Response,
		@Req() request: Request,
		@Body() twoFaCodeDto: twoFaCodeDto,
	) {
		try {
			const user = await this.authService.getUserCookie(request);
			if (!user) throw new UnauthorizedException('user not here');
			const isCodeValid = await this.twoFAService.isTwoFACodeValid(
				twoFaCodeDto.twoFaCode,
				user,
			);
			if (!isCodeValid) {
				throw new UnauthorizedException('Wrong authentication code');
			}
			const jwtToken = request.cookies['jwt'];
			await this.authService.loginTwoFa(user, response, true);
			response.send({ jwt: jwtToken });
			return { jwt: jwtToken };
		} catch (error) { }
	}
}
