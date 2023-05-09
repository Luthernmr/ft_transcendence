/*
https://docs.nestjs.com/providers#services
*/
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../Entities/user.entity';
import { Repository } from 'typeorm';
import { get } from 'http';

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
		async setOnline(user : User)
		{
			user.isOnline = true;
			await this.userRepository.save(user);
		}
		async setOffline(user : User)
		{
			user.isOnline = false;
			await this.userRepository.save(user);
		}

		async changeImg(user : User, img: string)
		{
			user.imgPdp = img;
			await this.userRepository.save(user);
		}
		async changeNickname(user : User, nickname: string)
		{
			user.nickname = nickname;
			await this.userRepository.save(user);
		}
		
}
