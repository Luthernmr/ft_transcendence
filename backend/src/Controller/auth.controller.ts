/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get,Res, Req, Post, Delete, Put, Body, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response, Request} from 'express';
import { JwtService } from '@nestjs/jwt'
import { UserService } from 'src/Services/user.service';


@Controller('api')
export class AuthController {
	constructor(
		private readonly userService: UserService,
		private jwtService: JwtService,	
	) {}

@Post('register')
  async register(
	@Body('pseudo') pseudo: string,
	@Body('email')  email: string,
	@Body('password') password: string,
	@Body('isOnline') isOnline: boolean,
	){
		const hashedPassword = await bcrypt.hash(password, 12);

		const user = await this.userService.create({
			pseudo,
			email,
			password: hashedPassword,
			isOnline,
		});
		delete user.password
		return user;
  }

  @Post('login')
  async login (
	@Body('email')  email: string,
	@Body('password') password: string,
	@Res({passthrough : true}) response : Response
  ){
	const user = await this.userService.getUser(email);
	if (!user)
	{
			throw new BadRequestException('invalid credentials');
	}
	if (!await bcrypt.compare(password, user.password))
	{
		throw new BadRequestException('invalid credentials');
	}
	const payload = {id : user.id, pseudo : user.pseudo, email : user.email};
	const jwt = await this.jwtService.signAsync(payload);
	response.cookie('jwt', jwt, {httpOnly : true});
	return {
		message : 'succes'
	};
  }

  @Get('user')
  async user(@Req() request : Request){
	try{
		const cookie = request.cookies['jwt'];
		const data = await this.jwtService.verifyAsync(cookie);
		const user = await this.userService.getUser(data.email)
		
		if (!user)
			return ("no user");
		const {password, ...result} = user;
		return result;
	}
	catch(e)
	{
		return{
			message : "unauthorized"
		}
	}
  }

  @Post('logout')
  async logout(@Res({passthrough : true}) response : Response)
  {
	response.clearCookie('jwt');
	return {
		message : "logout success"
	}
  }
}
