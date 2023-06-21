import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Room } from './room.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 250 })
  text: string;

  @CreateDateColumn()
  created_at: Date;

  @JoinTable()
  @ManyToMany(() => Room, (room: Room) => room.messages)
  room: Room;

  @JoinTable()
  @ManyToOne(() => User, (user: User) => user.messages)
  user: User;
}
