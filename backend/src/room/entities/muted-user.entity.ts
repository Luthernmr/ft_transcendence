import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/user.entity';
import { Room } from './room.entity';

@Entity()
export class MutedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.mutedUsers, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Room, (room) => room.mutedUsers, { onDelete: 'CASCADE' })
  room: Room;

  @Column('timestamp')
  muteEnd: Date;
}
