import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Room } from '../../room/entities/room.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ length: 250 })
  text: string;

  @CreateDateColumn()
  created_at: Date;

  @JoinTable()
  @ManyToOne(() => Room, (room: Room) => room.messages)
  room: Room;

  @JoinTable()
  @ManyToOne(() => User, (user: User) => user.messages)
  user: User;
}
