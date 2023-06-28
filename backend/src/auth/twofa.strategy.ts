
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
 
@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy( Strategy,'jwt-two-factor')
 {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
	console.log('test')
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
		console.log(request.cookies);
        return request?.cookies?.twofa;
      }]),
      secretOrKey: 'secret'
    });
  }
 
  async validate(payload : any) {
	console.log(payload)
    const user = await this.userService.getUserById(payload.id);
    if (!user.isTwoFA) {
      return user;
    }
    if (payload.isSecondFactorAuthenticated) {
      return user;
    }
  }
}