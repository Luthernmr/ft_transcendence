/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get,Res, Req, Post, Delete, Put, Body, BadRequestException,
UseGuards } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response, Request} from 'express';
import { JwtService } from '@nestjs/jwt'
import { UserService } from 'src/Services/user.service';
import { AuthGuard } from 'src/Guards/auth.guard';


@Controller('api')
export class AuthController {
	constructor(
		private readonly userService: UserService,
		private jwtService: JwtService,	
	) {}
@Post('register')
  async register(
	@Body('nickname') nickname: string,
	@Body('email')  email: string,
	@Body('password') password: string,
	){
		const hashedPassword = await bcrypt.hash(password, 12);

		const user = await this.userService.create({
			nickname,
			email,
			password: hashedPassword,
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
		throw new BadRequestException('bad password');
	}
	this.userService.setOnline(user);
	const payload = {id : user.id, nickname : user.nickname, email : user.email, isOnline : user.isOnline};
	const jwt = await this.jwtService.signAsync(payload);
	response.cookie('jwt', jwt, {httpOnly : true});
	return response.send({token : jwt});
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

  @Get('logout')
  async logout(@Res({passthrough : true}) response : Response, @Req() request : Request)
  {
	const cookie = request.cookies['jwt'];
	if (!cookie)
	{
		return {
			message : "no cookie set"
		}
	}
	const data = await this.jwtService.verifyAsync(cookie);
	const user = await this.userService.getUser(data.email);
	this.userService.setOffline(user)
	response.clearCookie('jwt');
	return {
		message : "ciao"
	}
  }
  @Get('isOnline')
  async isOnline(@Req() request : Request, @Res() response : Response)
  {
	try {
		const cookie = request.cookies['jwt'];
		if (!cookie) {
		  return response.send({ message: request.cookies['jwt'] });
		}
		const data = await this.jwtService.verifyAsync(cookie);
		if (!data) {
		  return response.send({ message: "data not set" });
		}
		const user = await this.userService.getUser(data.email);
		if (!user.isOnline) {
		  return response.send({ online: false });
		} else {
		  return response.send({ online: true });
		}
	  } catch (error) {
		console.error(error);
		return response.send({ message: "error verifying token" });
	  }
  }
  
}
