/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend } from './friend.entity';
import { User } from 'src/user/user.entity';
import { BlockedUser } from './blockedUser.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
    @InjectRepository(BlockedUser)
    private blockedUserRepository: Repository<BlockedUser>,
  ) {}

  async addFriend(data): Promise<any> {
	try {
		return this.friendRepository.save(data);
	} catch (error) {
		return error
	}
  }

  async blockUser(data): Promise<any> {
	try {
		return this.blockedUserRepository.save(data);
	} catch (error) {
		return error
	}
  }

  async deleteFriend(currentUser: User, friendUser: User) {
    try {
      const relation: any = await this.getRelation(currentUser, friendUser);
      await this.friendRepository.delete(relation);
    } catch (error) {
		return error
	}
  }
  async getFriends(currentUser: User): Promise<any> {
	  try {
		  const theyRequested = await this.friendRepository.find({
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
				isPlaying: true,
			  },
			},
		  });
	  
		  const iRequested = await this.friendRepository.find({
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
			  },
			},
		  });
	  
		  const friendList = [];
		  for (let i = 0; i < theyRequested.length; i++) {
			if (
			  !iRequested.find((item) => item.userA.id === theyRequested[i].userB.id)
			) {
			  friendList.push(theyRequested[i].userB);
			}
		  }
		  for (let i = 0; i < iRequested.length; i++) {
			if (
			  !theyRequested.find((item) => item.userB.id === iRequested[i].userA.id)
			) {
			  friendList.push(iRequested[i].userA);
			}
		  }
		  return friendList;
	} catch (error) {
		return error
	}
  }

  async getRelation(currentUser: User, userReceived: User) {
   try {
	   const relation1 = await this.friendRepository.find({
		 where: {
		   userA: currentUser,
		   userB: userReceived,
		 },
	   });
   
	   const relation2 = await this.friendRepository.find({
		 where: {
		   userA: userReceived,
		   userB: currentUser,
		 },
	   });
   
	   if (relation1.length) {
		 return relation1;
	   } else if (relation2.length) {
		 return relation2;
	   } else return null;
	
   } catch (error) {
	 return error
   }
  }

  /* -------------------------------------------------------------------------- */
  /*                              Blocked Features                              */
  /* -------------------------------------------------------------------------- */

  async getBlockedRelation1(currentUser: User, otherUser: User) {
    try {
		const relation1 = await this.blockedUserRepository.find({
		  where: {
			currentUser: currentUser,
			otherUser: otherUser,
		  },
		});
		  if (relation1.length) {
			return relation1;
		  } else return null;
	} catch (error) {
		return error
	}
  }
  async getBlockedRelation2(currentUser: User, otherUser: User) {
    try {
		const relation2 = await this.blockedUserRepository.find({
			where: {
				currentUser: otherUser,
				otherUser: currentUser,
			},
		  });
		if (relation2.length) {
			return relation2;
		  } else return null;
	} catch (error) {
		return error
	}
  }
  
  async getBlockedRelation(currentUser: User, otherUser: User) {
    try {
		const relation1 = await this.blockedUserRepository.find({
		  where: {
			currentUser: currentUser,
			otherUser: otherUser,
		  },
		});
		const relation2 = await this.blockedUserRepository.find({
			where: {
				currentUser: otherUser,
				otherUser: currentUser,
			},
		  });
		  if (relation1.length) {
			return relation1;
		  } else if (relation2.length) {
			return relation2;
		  } else return null;
	} catch (error) {
		return error
	}
  }

  async getBlockedUsers(currentUser: User): Promise<any> {
	try {
		const blockedList = await this.blockedUserRepository.find({
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
			},
		  },
		});
	
		let blockedList2 = [];
	
		for (let i = 0; i < blockedList.length; i++) {
		  blockedList2.push(blockedList[i].otherUser);
		}
	
		return blockedList2;
		
	} catch (error) {
		return error
	}
  }

  async unblockUser(currentUser: User, otherUser: User) {
    try {
      let relation: any = await this.getBlockedRelation(currentUser, otherUser);

      await this.blockedUserRepository.delete(relation);
    } catch (error) {
		return error
	}
  }
}
