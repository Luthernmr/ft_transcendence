/*
https://docs.nestjs.com/providers#services
*/
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { PendingRequest } from 'src/social/pendingRequest.entity';
import { JwtService } from '@nestjs/jwt';
import { FriendService } from 'src/social/friend.service';
import { Server, Socket } from "socket.io";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(PendingRequest)
		private pendingRequest: Repository<PendingRequest>,
	) { }

	async create(data: any): Promise<User> {
		return await this.userRepository.save(data);
	}

	async getUser(email: any): Promise<User> {
		return await this.userRepository.findOne({ where: { email: email } });
	}

	async getAllUser(): Promise<any> {
		const users = await this.userRepository.find();
		return users;
	}

	async getUserById(id: number): Promise<User> {
		return await this.userRepository.findOne({ where: { id: id } });
	}

	async setSocket(id: number, socketId: string) {
		var user: any = await this.getUserById(id);
		user.socketId = socketId;
		user = await this.userRepository.save(user);
		return user
	}

	async setOnline(user: User) {
		if (user) {
			user.isOnline = true;
			await this.userRepository.save(user);
		}
	}
	async setOffline(user: User) {
		user.isOnline = false;
		await this.userRepository.save(user);
	}

	async changeImg(user: User, img: string) {
		user.imgPdp = img;
		await this.userRepository.save(user);
	}
	async changeNickname(user: User, nickname: string) {
		user.nickname = nickname;
		await this.userRepository.save(user);
	}

	async createPendingRequest(data: any): Promise<PendingRequest> {
		const existingRequest = await this.pendingRequest.findOne({
			where: {
				type: data.type,
				senderId: data.senderId,
				user : data.user
			}
		});
		//console.log (existingRequest)
		if (existingRequest) {
			throw new BadRequestException('cannot create Request already exists for this person.');
		}
		return await this.pendingRequest.save(data);
	}

	async getPendingRequestById(id: number): Promise<PendingRequest> {
		return await this.pendingRequest.findOne({ where: { id: id } })
	}

	async deletePendingRequestById(request: PendingRequest) {
		try {
      //console.log('delet1', request);
      const result = await this.pendingRequest.delete(request.id);
      //console.log('delet', result);
      return result;
    } catch (error) {
      console.error(
        'An error occurred while deleting the pending request:',
        error,
      );
      throw error;
    }
	}

	async getAllPendingRequest(user: any): Promise<any> {
		const userWithPendingRequests = await this.userRepository.findOne({ where: user, relations: ['pendingRequests'] });
		return userWithPendingRequests.pendingRequests;
	}

	async setTwoFASecret(secret: string, userId: number) {
		return await this.userRepository.update(userId, {
			twoFASecret: secret
		});
	}

	async turnOnTwoFA(userId: number) {
		return await this.userRepository.update(userId, {
			isTwoFA: true
		});
	}

	async turnOffTwoFA(userId: number) {
		await this.userRepository.update(userId, {
			twoFASecret: ""
		})
		return await this.userRepository.update(userId, {
			isTwoFA: false
		});
	}

	async getRoomsByUID( userId: number) {
		return await (this.userRepository.findOne({
			where: {id: userId},
			relations: {
				rooms: {users: true}
			}
		}))
	}
}
