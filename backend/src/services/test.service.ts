import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class TestService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	welcome() : string {
		return 'Welcome to transcendence v0.0.1f8.2!';
	}

	async createUser() : Promise<User> {
		const newUser = new User();
		newUser.name = "Aza";
		newUser.email = "aza@lol.com";
		newUser.password = "123";
		await this.userRepository.save(newUser);
		return newUser;
	}
}
