import { Message } from '../../message/entities/message.entity';
import { Mute } from './muted-user.entity';
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
  id: number;

  @Column({ length: 20, nullable: true })
  name: string;

  @Column()
  ownerId: number;

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ default: false })
  isDm: boolean;

  @Column({ length: 80, nullable: true })
  password: string;

  @ManyToMany(() => User, (user: User) => user.rooms)
  @JoinTable()
  users: User[];

  @ManyToMany(() => User, (user: User) => user.adminRooms)
  @JoinTable()
  admins: User[];

  @ManyToMany(() => User, (user: User) => user.bannedRooms)
  @JoinTable()
  bannedUsers: User[];

  @OneToMany(() => Mute, (mute) => mute.room)
  mutes: Mute[];

  @OneToMany(() => Message, (message: Message) => message.room, {
    cascade: true,
  })
  messages: Message[];
}
