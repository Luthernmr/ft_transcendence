import { User } from 'src/user/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToMany, ManyToOne, OneToOne } from 'typeorm';

@Entity('pendingRequest')
export class PendingRequest {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	type: string;

	@Column({ default: false })
	accepted : boolean;

	@Column()
	senderId: number

	@Column({nullable : true})
	senderNickname: string

	@ManyToOne(() => User, user => user.pendingRequests)
	@JoinTable()
	user : User
	
}