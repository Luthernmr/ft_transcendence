import { Controller, Get, Post, Body, Delete } from '@nestjs/common';
import { AppService } from './app.service';
import * as bcrypt from 'bcrypt'; 
import { User } from './entities/user.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('register')
  async sayeHi()
  {
		console.log("hellor");
  }

  @Post('register')
  async register(
	@Body('name') name:string,
	@Body('email') email:string,
	@Body('password') password:string,
	){
		const hashedPassword = await bcrypt.hash(password, 12);
		
		console.log('user create');
		console.log(name);
		console.log(email);
		console.log(password);
		return this.appService.register({
			name,
			email,
			password : hashedPassword
		});
	};
	
	@Delete('register')
	async removeUser(@Body('id') id:number)
	{
		console.log(`id : ${id}`);
		this.appService.removeUser(id);
		console.log("removed");
	};
}
