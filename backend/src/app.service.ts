import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './Entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
	@InjectRepository(User)
    private usersRepository: Repository<User>,
  	) {}

	async create(data: any): Promise<User>{
		return this.usersRepository.save(data);
	}
	async getUser(email : string): Promise<User>
	{
		return this.usersRepository.findOne({ where: { email: email } });
	}
}
