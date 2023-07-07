
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '../user/user.service';
 
@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy( Strategy,'jwt-two-factor')
 {
  constructor(
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.twofa;
        },
      ]),
      secretOrKey: 'secret',
    });
  }
 
  async validate(payload : any) {
    const user = await this.userService.getUserById(payload.id);
    if (!user.isTwoFA) {
      return user;
    }
    if (payload.isSecondFactorAuthenticated) {
      return user;
    }
  }
}