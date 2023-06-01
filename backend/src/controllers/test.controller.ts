import { Controller, Get, Body, Req } from '@nestjs/common';
import { TestService } from '../services/test.service'

@Controller('test')
export class TestController {
	constructor(private readonly testService: TestService) {}

	@Get('/v1')
	welcome() : string
	{
		const message = this.testService.welcome();
		return message;
	}

	@Get('/user')
	async createUser(@Body() data: string) {
		const newUser = await this.testService.createUser(data);
		return ;
	}
}
