import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import 'dotenv/config'

@Injectable()
export class auth42Strategy extends PassportStrategy(Strategy, '42') {
	constructor() {
    super({
      authorizationURL: process.env.AUTHORIZATION_URL,
      tokenURL: process.env.TOKEN_URL,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    });
  }
	validate(access_token: string, refresh_token: string, user: any): any {
		return ({ access_token, user });
	}
}