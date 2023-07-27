import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor',
) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.twofa;
        },
      ]),
      secretOrKey: process.env.SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.userService.getUserById(payload.id);
	if (!user)
		throw new BadRequestException('Error while getting user')
    if (!user.isTwoFA) {
      return user;
    }
    if (payload.isSecondFactorAuthenticated) {
      return user;
    }
  }
}
