import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/user.entity';
import { Room } from './room.entity';

@Entity()
export class Mute {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.mutes)
  user: User;

  @ManyToOne(() => Room, (room) => room.mutes)
  room: Room;

  @Column('timestamp')
  muteEnd: Date;
}
