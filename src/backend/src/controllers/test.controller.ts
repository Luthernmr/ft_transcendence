import { Controller, Get, Body } from '@nestjs/common';

@Controller('test')
export class TestController {
	@Get('/v1')
	function() : string
	{
		return 'Welcome to transcendence v0.0.1f8.2!';
	}
}
