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
import { BlockedUser } from './blockedUser.entity';

@Injectable()
export class FriendService {
	constructor(
		@InjectRepository(Friend)
		private friendRepository: Repository<Friend>,
		@InjectRepository(BlockedUser)
		private blockedUserRepository: Repository<BlockedUser>
	) { }

	async addFriend(data): Promise<any> {
		return this.friendRepository.save(data)
	}

	async blockUser(data): Promise<any> {
		return this.blockedUserRepository.save(data)
	}
	

	async deleteFriend(currentUser : User , friendUser : User){
		const relation : any = await this.getRelation(currentUser, friendUser);
		try {
			await this.friendRepository.delete(relation)
		}
		catch(error)
		{
			console.log(error)
		}
		console.log(relation)
	}
	async getFriends(currentUser: User): Promise<any> {

		const theyRequested = await this.friendRepository.find({ //The relations when They send me a Friend request;
			where: {
				userA: currentUser,
			},
			relations: ['userB'],
			select: {
				userB: {
					id: true,
					nickname: true,
					imgPdp: true,
					isOnline: true,
				}
			}
		});

		const iRequested = await this.friendRepository.find({ //The relations when i send a Friend request to someone;
			where: {
				userB: currentUser,
			},
			relations: ['userA'],
			select: {
				userA: {
					id: true,
					nickname: true,
					imgPdp: true,
					isOnline: true,
				}
			}
		});
		
		const friendList = [];

		
		
		for (let i = 0; i < theyRequested.length; i++) {
			if (!iRequested.find(item => item.userA.id === theyRequested[i].userB.id)) {
				friendList.push(theyRequested[i].userB);
				console.log('yes');
			}
			console.log('no')

		}
		
		for (let i = 0; i < iRequested.length; i++) {
			if(!theyRequested.find(item => item.userB.id === iRequested[i].userA.id)){
				friendList.push(iRequested[i].userA);
				console.log('yes')
			}
			console.log('alreadyFriends')
		}
		
		console.log("FriendList", friendList)
		return friendList;
	}

	async getRelation(currentUser: User, userReceived: User)
	{
		const relation1 = await this.friendRepository.find({
			where: {
				userA: currentUser,
				userB: userReceived
			}
		})
		const relation2= await this.friendRepository.find({
			where: {
				userA: userReceived,
				userB: currentUser
			}
		})
		
		if (relation1.length)
		{
			console.log('relqtion 1', relation1)
			return relation1
		}
		else if (relation2.length)
		{
			console.log('relqtion 2', relation2)
			return relation2
		}
	}

	async getBlockedRelation(currentUser: User, userReceived: User)
	{
		const relation1 = await this.blockedUserRepository.find({
			where: {
				currentUser: currentUser,
				otherUser: userReceived
			}
		})
		const relation2= await this.blockedUserRepository.find({
			where: {
				currentUser: userReceived,
				otherUser: currentUser
			}
		})
		
		if (relation1.length)
		{
			console.log('relqtion 1', relation1)
			return relation1
		}
		else if (relation2.length)
		{
			console.log('relqtion 2', relation2)
			return relation2
		}
	}

	async getBlockedUsers(currentUser: User): Promise<any> {

		const blockedList = await this.blockedUserRepository.find({ //The relations when They send me a Friend request;
			where: {
				currentUser: currentUser,
			},
			relations: ['otherUser'],
			select: {
				otherUser: {
					id: true,
					nickname: true,
					imgPdp: true,
					isOnline: true,
				}
			}
		});

		let blockedList2 = []
		console.log('blockedList',blockedList)
		for (let i = 0; i < blockedList.length; i++) {
			blockedList2.push(blockedList[i].otherUser);
		}
		
		console.log("blockedList service", blockedList2)
		return blockedList2;
	}


}
