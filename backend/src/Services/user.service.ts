/*
https://docs.nestjs.com/providers#services
*/
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../Entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
	constructor(
			@InjectRepository(User)
			private userRepository: Repository<User>,
		) {}

		async create(data: any): Promise<User>{
			return this.userRepository.save(data);
		}
		async getUser(email: any): Promise<User>
		{
			return this.userRepository.findOne({ where: { email: email } });
		}
}
