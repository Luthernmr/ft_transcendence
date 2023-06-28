import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PongHistory } from 'src/pong/pongHistory.entity'
import { Repository } from 'typeorm';
import { Score, IDPair } from './pong.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';

@Injectable()
export class HistoryService {
	constructor(
		private userService: UserService,
		@InjectRepository(PongHistory)
		private pongHistory: Repository<PongHistory>
	) {
	}

	async addEntry(ids: IDPair, score: Score) {
		//const user1 = await this.userService.getUserById(ids.idP1);
		//const user2 = await this.userService.getUserById(ids.idP2);

		const winner = score.scoreP1 > score.scoreP2 ? ids.idP1 : ids.idP2;

		const history = {
			user1ID: ids.idP1,
			user2ID: ids.idP2,
			winnerID: winner,
			scoreUser1: score.scoreP1,
			scoreUser2: score.scoreP2
		};

		await this.pongHistory.save(history);

		const user1 = await this.userService.getUserById(ids.idP1);
		this.getUserHistory(user1);
	}

	async getAllHistories(): Promise<PongHistory[]> {
		return await this.pongHistory.find();
	}

	async getUserHistory(user: User): Promise<PongHistory[]> {
		const history = await this.pongHistory.find({
			where: [
				{ user1ID: user.id },
				{ user2ID: user.id },
			]
		});

		// console.log(history);

		// console.log("allHistories: ");
		// const allHistory = await this.pongHistory.find();
		// console.log(allHistory);

		return history;
	}
}
