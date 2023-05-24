import { User } from 'src/user/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToMany } from 'typeorm';

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

	@ManyToMany(() => User, user => user.friends)
	@JoinTable()
	users: User[];
}