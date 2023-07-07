import { User } from 'src/user/user.entity';
import { Entity, PrimaryGeneratedColumn, JoinTable, ManyToOne } from 'typeorm';

@Entity('blockedUser')
export class BlockedUser {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, user => user.blockedUsers)
	@JoinTable()
	currentUser: User;

	@ManyToOne(() => User, user => user.blockedUsers)
	@JoinTable()
	otherUser: User;
}