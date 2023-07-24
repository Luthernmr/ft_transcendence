import { toFileStream } from 'qrcode';
import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { Response } from 'express';

@Injectable()
export class TwoFAService {
  constructor(private readonly userService: UserService) {}
  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return await toFileStream(stream, otpauthUrl);
  }

  public async generateTwoFASecret(user: Partial<User>) {
	try {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(user.email, '2FA', secret);
		await this.userService.setTwoFASecret(secret, user.id);
		return {
		  secret,
		  otpauthUrl,
		};
	} catch (error) {
		return error;
	}
}
  public async isTwoFACodeValid(twoFACode: string, user: User) {
	try {
		return authenticator.verify({
		  token: twoFACode,
		  secret: user.twoFASecret,
		});
	} catch (error) {
		return (error);
	}
  }
}
