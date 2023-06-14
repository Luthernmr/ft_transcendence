/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Friend } from './friend.entity';
import { PendingRequest } from './pendingRequest.entity';

@Injectable()
export class FriendService {
	constructor(
		@InjectRepository(Friend)
			private friendRepository: Repository<Friend>,
			private readonly userService: UserService,
	) { }

	async addFriend(data) : Promise <any>
	{		
		return this.friendRepository.save(data)
	}

	
	async getFriendList() : Promise<any>
	{
		console.log(this.friendRepository);
	}
}
