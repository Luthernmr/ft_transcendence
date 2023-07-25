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
	HttpException,
	HttpStatus,
	ValidationError,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response, Request, response } from 'express';
import { UserService } from 'src/user/user.service';
import { LoginDto, RegisterDto, twoFaCodeDto } from 'src/user/user.dto';
import { AuthService } from 'src/auth/auth.service';
import { TwoFAService } from './twofa.service';
import JwtTwoFactorGuard from './twofa.guard';
import { LocalAuthGuard } from './auth.guard';
import { User } from 'src/user/user.entity';
import { plainToClass } from 'class-transformer';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { validateOrReject } from 'class-validator';


@Controller('api')
export class AuthController {
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,
		private readonly twoFAService: TwoFAService,
	) { }
	@Post('register')
	@UsePipes(new ValidationPipe())
	async register(@Body() data : any, @Res({ passthrough: true }) response: Response) {
		try {
			const dto = plainToClass(RegisterDto,data);
			console.log(data);
			console.log(dto);
			await validateOrReject(dto).catch((errors: ValidationError[]) => {
				throw new BadRequestException(errors);
			  });
			const salt = await bcrypt.genSalt();
			const hashedPassword = await bcrypt.hash(dto.password, salt);
			const user = await this.userService.create({
				nickname: dto.nickname,
				email: dto.email,
				password: hashedPassword,
				pendingRequests: [],
			});
			delete user.password;
			return user;
		} catch (error) {
			return error
		}
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
				throw new BadRequestException('Wrong email');
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
			return {
				message: 'unauthorized',
			};
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
			return {
				message: 'cannot generate new qrcode',
			};
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
				twoFaCodeDto.twoFaCode, user
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
		try {
			const user = await this.authService.getUserCookie(request);
			await this.userService.turnOffTwoFA(user.id);
		} catch (error) {
			return {
				message: 'cannot activate 2FA',
			};
		}
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
			if (!user)
				throw new UnauthorizedException('user not here');
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
		} catch (error) 
		{
			return {
				message: 'failed 2fa',
			};
		}
	}
}
