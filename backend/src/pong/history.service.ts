import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PongHistory } from 'src/pong/pongHistory.entity'
import { Repository } from 'typeorm';
import { Score, IDPair } from './pong.service';

@Injectable()
export class HistoryService {
	constructor(
		@InjectRepository(PongHistory)
		private pongHistory: Repository<PongHistory>
	) {
		console.log(pongHistory);
	}

	async addEntry(ids: IDPair, score: Score) {
		const history = {
			user1ID: ids.idP1,
			user2ID: ids.idP2,
			scoreUser1: score.scoreP1,
			scoreUser2: score.scoreP2
		};

		console.log(history);

		await this.pongHistory.save(history);
	}

	async getUserHistoryById(id: number) {
		const history = await this.pongHistory.find({ where: [
															{ user1ID: id },
															{ user2ID: id },
														]
													});
		return history;
	}
}
