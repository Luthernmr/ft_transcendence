import { User } from 'src/user/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

@Entity('friend')
export class Friend {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	img: string;

	@Column()
	blocked: boolean;

	@ManyToOne(() => User, user => user.friends)
	@JoinTable()
	user: User;
}