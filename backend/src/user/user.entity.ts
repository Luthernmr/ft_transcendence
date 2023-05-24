import { Friend } from 'src/social/friend.entiy';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nickname: string;

  @Column({unique : true})
  email: string;

  @Column({nullable: true})
  password: string;

  @Column()
  imgPdp: string;

  @Column({ default: false })
  isOnline: boolean;

  @ManyToMany(() => Friend, friend => friend.users)
  @JoinTable()
  friends: Friend[];
}