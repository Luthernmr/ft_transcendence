import { Message } from './message.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';

@Entity('Room')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20, nullable: true })
  name: string;

  @Column()
  ownerId: number;

  @Column({default: false})
  isPrivate: boolean;

  @Column({ nullable: true })
  password: string;

  @ManyToMany(() => User, (user: User) => user.room)
  @JoinTable()
  users: User[];

  @ManyToMany(() => User, (user: User) => user.bannedRooms)
  @JoinTable()
  bannedUsers: User[];

  @OneToMany(() => Message, (message: Message) => message.room)
  messages: Message[];
}
