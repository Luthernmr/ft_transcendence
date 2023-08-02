import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PongHistory } from 'src/pong/pongHistory.entity'
import { Repository } from 'typeorm';
import { Score, IDPair } from './pong.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';

const XP_GAIN_WIN = 15;
const XP_GAIN_LOSS = 5;

interface History {
	id: number,
	winner: boolean,
	opponent: User,
	myScore: number,
	opponentScore: number,
	customMode: boolean
}

@Injectable()
export class HistoryService {
	constructor(
		private userService: UserService,
		@InjectRepository(PongHistory)
		private pongHistory: Repository<PongHistory>,
		@InjectRepository(User)
		private userRepository: Repository<User>
	) {
	}

	async addEntry(ids: IDPair, score: Score, custom: boolean = false) {
		const user1 = await this.userService.getUserById(ids.idP1);
		const user2 = await this.userService.getUserById(ids.idP2);

		const winner = score.scoreP1 > score.scoreP2 ? 1 : 2;

		const winnerUser = winner === 1 ? user1 : user2;
		const loserUser = winnerUser === user1 ? user2 : user1;

		const levelDiff = loserUser.level - winnerUser.level;
		const xpGained =
		levelDiff > 0 ? XP_GAIN_WIN * (levelDiff + 1) : XP_GAIN_WIN;

		try {
			await this.addXP(winnerUser, xpGained);
			await this.addXP(loserUser, XP_GAIN_LOSS);
		} catch (error) {
		}

		const history = {
		user1: user1,
		user2: user2,
		winner: winner,
		scoreUser1: score.scoreP1,
		scoreUser2: score.scoreP2,
		customMode: custom
		};

		try {
			await this.pongHistory.save(history);
		} catch (error) {
		}
  }

	async addXP(user: User, xp: number) {
    const userXP = user.experience + xp;

    let userLevel = 1;
    let ladder = 1;

    while (userXP >= ladder * 100) {
      userLevel++;
      ladder += userLevel;
    }

    const previousLadder = ladder - userLevel;
    const currentLevelXP = userXP - previousLadder * 100;
    const percentageToNextLevel = currentLevelXP / (userLevel * 100);
    const ratioToNextLevel = Math.trunc(percentageToNextLevel * 100);

	try {
		await this.userRepository.update(user.id, {
		level: userLevel,
		experience: userXP,
		ratioToNextLevel: ratioToNextLevel,
		});
	} catch (error) {
	}
  }

	async getAllHistories(): Promise<PongHistory[]> {
		return await this.pongHistory.find();
	}

	async getUserHistory(user: User): Promise<History[]> {
		const history : History[] = [];
		
		const historyA = await this.pongHistory.find({
			where: { 
				user1: user,
			},
			relations: {
				user2: true
			},
			select: {
				user2: {
					id: true,
					nickname: true,
					imgPdp: true,
					isOnline: true,
				}
			}
		});

		for (let i = 0; i < historyA.length; i++) {
			history.push({
				id: historyA[i].id,
				winner: historyA[i].winner === 1 ? true : false,
				opponent: historyA[i].user2,
				myScore: historyA[i].scoreUser1,
				opponentScore: historyA[i].scoreUser2,
				customMode :  historyA[i].customMode
			})
		}

		const historyB = await this.pongHistory.find({
			where: {
				user2: user,
			},
			relations: {
				user1: true
			},
			select: {
				user1: {
					id: true,
					nickname: true,
					imgPdp: true,
					isOnline: true
				}
			}
		});

		for (let i = 0; i < historyB.length; i++) {
			history.push({
				id: historyB[i].id,
				winner: historyB[i].winner === 2 ? true : false,
				opponent: historyB[i].user1,
				myScore: historyB[i].scoreUser2,
				opponentScore: historyB[i].scoreUser1,
				customMode :  historyB[i].customMode

			})
		}

		history.sort((a, b) => (a.id > b.id ? -1 : 1));

		return history;
	}
}
