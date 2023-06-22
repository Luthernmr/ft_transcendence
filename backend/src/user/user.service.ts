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
		//this.userRepository.find()
		const users = await this.userRepository.find();
		return users;
	}

	async getUserById(id: number): Promise<User> {
		return await this.userRepository.findOne({ where: { id: id } });
	}

	async setSocket(id: number, socketId: string) {
		var user: any = await this.getUserById(id);
		console.log('before', user.socketId)

		user.socketId = socketId;
		user = await this.userRepository.save(user);
		console.log('after', await this.getUserById(id))
		return user

	}

	async setOnline(user: User) {
		if(user)
		{
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
		console.log("data", data);
		const existingRequest = await this.pendingRequest.findOne({
			where: {
				type: data.type,
				senderId: data.senderId
			}
		});
		console.log('exiting', existingRequest)
		if (existingRequest) {
			throw new BadRequestException('Request already exists for this person.');
		}

		return await this.pendingRequest.save(data);
	}

	async getPendingRequestById(id: number): Promise<PendingRequest> {
		return await this.pendingRequest.findOne({ where: { id: id } })
	}

	async deletePendingRequestById(id: number) {
		await this.pendingRequest.delete(await this.getPendingRequestById(id))
	}

	async getAllPendingRequest(user: any): Promise<any> {
		const userWithPendingRequests = await this.userRepository.findOne({where : user, relations: ['pendingRequests'] });
		//console.log("pending list", userWithPendingRequests.pendingRequests);
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
			twoFASecret : ""
		})
		return await this.userRepository.update(userId, {
		  isTwoFA: false
		});
	}
}
