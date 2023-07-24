import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { PendingRequest } from 'src/social/pendingRequest.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PendingRequest)
    private pendingRequest: Repository<PendingRequest>,
  ) {}

  async create(data: any): Promise<User> {
	try {
		return await this.userRepository.save(data);
	} catch (error) {
		return error
	}
  }

  async getUser(email: any): Promise<User> {
	try {
		return await this.userRepository.findOne({ where: { email: email } });
		
	} catch (error) {
		return error
	}
  }

  async getAllUser(): Promise<User[]> {
	try {
		const users = await this.userRepository.find();
		return users;
		
	} catch (error) {
		return error	
	}
  }

  async getAllUserOnline(): Promise<User[]> {
	try {
		const users = await this.userRepository.find({where : {isOnline : true}});
		return users;
	} catch (error) {
		return error
	}
  }
  async getUserById(id: number): Promise<User> {
	try {
		return await this.userRepository.findOne({ where: { id: id } });
	} catch (error) {
		return error
	}
  }

  async setSocket(id: number, socketId: string) {
	try {
		var user: any = await this.getUserById(id);
		if (user) {
		  user.socketId = socketId;
		  user = await this.userRepository.save(user);
		  return user;
		}
	} catch (error) {
		return error
	}
  }

  async setOnline(user: User) {
	  try {
		  if (user) {
			user.isOnline = true;
			await this.userRepository.save(user);
		  }
	} catch (error) {
		return error
	}
  }
  async setOffline(user: User) {
	try {
		user.isOnline = false;
		await this.userRepository.save(user);
	} catch (error) {
		return error
	}
  }

  async changeImg(user: User, img: string) {
	try {
		user.imgPdp = img;
		await this.userRepository.save(user);
	} catch (error) {
		return error
	}
  }
  async changeNickname(user: User, nickname: string) {
	try {
		user.nickname = nickname;
		await this.userRepository.save(user);
	} catch (error) {
		return error
	}
  }

  async isNicknameAlreadyUsed(nickname: string): Promise<boolean> {
   try {
	   const count = await this.userRepository.count({
		 where: { nickname: nickname },
	   });
	   return count > 0;
   } catch (error) {
	return error
   }
  }

  async createPendingRequest(data: any): Promise<PendingRequest> {
   try {
	   const existingRequest = await this.pendingRequest.findOne({
		 where: {
		   type: data.type,
		   senderId: data.senderId,
		   user: data.user,
		 },
	   });
   
	   if (existingRequest) {
		 throw new BadRequestException(
		   'cannot create Request already exists for this person.',
		 );
	   }
	   return await this.pendingRequest.save(data);
   } catch (error) {
	return error
   }
  }

  async getPendingRequestById(id: number): Promise<PendingRequest> {
	try {
		return await this.pendingRequest.findOne({ where: { id: id } });
		
	} catch (error) {
		return error
	}
  }

  async deletePendingRequestById(request: PendingRequest) {
    try {
      const result = await this.pendingRequest.delete(request.id);

      return result;
    } catch (error) {
      console.error(
        'An error occurred while deleting the pending request:',
        error,
      );
      throw error;
    }
  }

  async getAllPendingRequest(user: User): Promise<PendingRequest[]> {
	try {
		const userWithPendingRequests = await this.userRepository.findOne({
		  where: user,
		  relations: ['pendingRequests'],
		});
		return userWithPendingRequests.pendingRequests;
	} catch (error) {
		return error
	}
  }

  async setTwoFASecret(secret: string, userId: number) {
	try {
		return await this.userRepository.update(userId, {
		  twoFASecret: secret,
		});
	} catch (error) {
		return error
	}
  }

  async turnOnTwoFA(userId: number) {
	try {
		return await this.userRepository.update(userId, {
		  isTwoFA: true,
		});
	} catch (error) {
		return error
	}
  }

  async turnOffTwoFA(userId: number) {
	try {
		await this.userRepository.update(userId, {
		  twoFASecret: '',
		});
		return await this.userRepository.update(userId, {
		  isTwoFA: false,
		});
		
	} catch (error) {
		return error
	}
}

  async getRoomsByUID(userId: number) {
	try {
		return await this.userRepository.findOne({
		  where: { id: userId },
		  relations: {
			rooms: { users: true },
		  },
		});
	} catch (error) {
		return error
	}
  }
}
