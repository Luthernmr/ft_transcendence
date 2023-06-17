import { User } from 'src/user/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

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