import { Friend } from 'src/social/friend.entity';
import { PendingRequest } from 'src/social/pendingRequest.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nickname: string;

  @Column({unique : true})
  email: string;

  @Column({nullable: true})
  password: string;

  @Column({nullable: true})
  imgPdp: string;

  @Column({ default: false })
  isOnline: boolean;

  @Column({nullable: true})
  socketId: string;

  @OneToMany(() => Friend, friend => friend.user)
  @JoinTable()
  friends: Friend[];

  @OneToMany(() => PendingRequest, pendingRequest => pendingRequest.user)
  @JoinTable()
  pendingRequests: PendingRequest[];
}