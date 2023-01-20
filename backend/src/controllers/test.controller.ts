import { Controller, Get, Body } from '@nestjs/common';
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
	async createUser() {
		const newUser = await this.testService.createUser();
		return ;
	}
}
