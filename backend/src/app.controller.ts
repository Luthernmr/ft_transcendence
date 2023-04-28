import { Controller, Get, Post, Delete, Put, Body, BadRequestException } from '@nestjs/common';
import { AppService } from './app.service';
import * as bcrypt from 'bcrypt';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('register')
  async register(
	@Body('pseudo') pseudo: string,
	@Body('email')  email: string,
	@Body('password') password: string,
	@Body('isOnline') isOnline: boolean,
	){
		const hashedPassword = await bcrypt.hash(password, 12);

		return this.appService.create({
			pseudo,
			email,
			password: hashedPassword,
			isOnline,
		});
  }

  @Post('login')
  async login (
	@Body('email')  email: string,
	@Body('password') password: string
  ){
	const user = await this.appService.getUser(email);
	if (!user)
	{
			throw new BadRequestException('invalid credentials');
	}
	if (!await bcrypt.compare(password, user.password))
	{
		throw new BadRequestException('invalid credentials');
	}
	return user;
  }
}