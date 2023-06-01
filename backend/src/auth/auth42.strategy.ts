import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';

@Injectable()
export class auth42Strategy extends PassportStrategy(Strategy, '42') {
	constructor() {
		super({
			authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
			tokenURL: 'https://api.intra.42.fr/oauth/token',
			clientID: 'u-s4t2ud-4e4b700d8e948264d6535a43e80e6a0f64a8f20752bd33c1cc2b97bbac5a53d7',
			clientSecret: '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',
			callbackURL: '/auth/42',
		});
	}
	validate(access_token: string, refresh_token: string, user: any): any {
		return ({ access_token, user });
	}
}