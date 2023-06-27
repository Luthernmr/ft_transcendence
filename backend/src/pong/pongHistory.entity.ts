import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity('pong')
export class PongHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user1: User;

  @OneToOne(() => User)
  @JoinColumn()
  user2: User;

  @Column()
  scoreUser1: number;

  @Column()
  scoreUser2: number;

  @Column({default: false})
  customMode: boolean;
}