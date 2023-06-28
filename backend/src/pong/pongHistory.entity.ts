import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity('history')
export class PongHistory {
  @PrimaryGeneratedColumn()
  id: number;

  //@ManyToMany(() => User)
  //@JoinTable()
  //user1: User;
  @Column()
  user1ID: number;

  //@ManyToMany(() => User)
  //@JoinTable()
  //user1: User;
  @Column()
  user2ID: number;

  //@ManyToMany(() => User)
  //@JoinTable()
  //user1: User;
  @Column()
  winnerID: number;

  @Column()
  scoreUser1: number;

  @Column()
  scoreUser2: number;

  @Column({default: false})
  customMode: boolean;
}