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
		const user1 = await this.userService.getUserById(ids.idP1);
		const user2 = await this.userService.getUserById(ids.idP2);

		const winner = score.scoreP1 > score.scoreP2 ? user1 : user2;

		const history = {
			user1: user1,
			user2: user2,
			winner: winner,
			scoreUser1: score.scoreP1,
			scoreUser2: score.scoreP2
		};

		await this.pongHistory.save(history);
	}

	async getUserHistory(user: User): Promise<PongHistory[]> {
		const history = await this.pongHistory.find({
			where: [
				{ user1: user },
				{ user2: user },
			]
		});
		return history;
	}
}
