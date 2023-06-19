/*
https://docs.nestjs.com/providers#services
*/
import { toFileStream } from 'qrcode';
import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';


@Injectable()
export class TwoFAService { 
	constructor (
		private readonly userService: UserService,
	  ) {}
	public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		return toFileStream(stream, otpauthUrl);
	  }

	  public async generateTwoFactorAuthenticationSecret(user: User) {
		const secret = authenticator.generateSecret();
	 
		const otpauthUrl = authenticator.keyuri(user.email, ('2FA'), secret);
	 
		await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);
	 
		return {
		  secret,
		  otpauthUrl
		}
	  }
}
