import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity('history')
export class PongHistory {
  @PrimaryGeneratedColumn()
  id: number;

  //@ManyToMany(() => User)
  //@JoinTable()
  //user1: User;
  @Column({nullable : true})
  user1ID: number;

  //@ManyToMany(() => User)
  //@JoinTable()
  //user1: User;
  @Column({nullable : true})
  user2ID: number;

  //@ManyToMany(() => User)
  //@JoinTable()
  //user1: User;
  @Column({nullable : true})
  winnerID: number;

  @Column({nullable : true})
  scoreUser1: number;

  @Column({nullable : true})
  scoreUser2: number;

  @Column({default: false})
  customMode: boolean;
}