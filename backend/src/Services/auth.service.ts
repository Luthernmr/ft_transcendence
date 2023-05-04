/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService) {}
	
	async login(user: any): Promise<any> {
		const payload = {id : user.id, nickname : user.nickname, email : user.email, isOnline : user.isOnline};
		const jwt = await this.jwtService.sign(payload);
		return {
		  access_token: jwt,
		};
	}
}
