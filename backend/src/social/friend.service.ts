/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Friend } from './friend.entiy';

@Injectable()
export class FriendService {
	constructor(
		@InjectRepository(Friend)
			private friendRepository: Repository<Friend>,
		private readonly userService: UserService,
	) { }

	async addFriend(id : number) : Promise <any>
	{
		const user = await this.userService.getUserById(id);
		
		this.friendRepository.save({
			id: user.id,
			name: user.nickname
		})
	}

	async getFriendList() : Promise<any>
	{
		console.log(this.friendRepository);
	}
}
