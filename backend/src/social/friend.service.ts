/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Friend } from './friend.entity';
import { PendingRequest } from './pendingRequest.entity';
import { User } from 'src/user/user.entity';
import { request } from 'http';

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

	async getFriends(currentUser: User): Promise<any> {
	
		const theyRequested = await this.friendRepository.find({ //The relations when They send me a Friend request;
			where : { 
				userA : currentUser,
		}, 
		relations: ['userB'],
		select :{
				userB :{
					id : true,
					nickname : true,
					imgPdp : true
				}
		}});

		const iRequested = await this.friendRepository.find({ //The relations when i send a Friend request to someone;
			where : { 
				userB : currentUser,
		}, 
		relations: ['userA'],
		select :{
				userA :{
					id : true,
					nickname : true,
					imgPdp : true
				}
		}});
	


		const friendList =  [];

		for(let i = 0; i < theyRequested.length; i++){
			friendList.push(theyRequested[i].userB)
		}
		console.log("FriendList",friendList)
		return friendList;
	  }

}
