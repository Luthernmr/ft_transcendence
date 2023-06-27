/*
https://docs.nestjs.com/providers#services
*/
import { toFileStream } from 'qrcode';
import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { AnyTxtRecord } from 'dns';
import { Response } from 'express'


@Injectable()
export class TwoFAService {
	constructor(
		private readonly userService: UserService,
	) { }
	
	public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		return await toFileStream(stream, otpauthUrl);
	}

	public async generateTwoFASecret(user: any) {
		const secret = await authenticator.generateSecret();

		const otpauthUrl = await authenticator.keyuri(user.email, ('2FA'), secret);

		user = await this.userService.setTwoFASecret(secret, user.id);
		return {
			secret,
			otpauthUrl
		}
	}

	public async isTwoFACodeValid(twoFACode: string, user: User) {
		return authenticator.verify({
			token: twoFACode,
			secret: user.twoFASecret
		})
	}
}
