import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pseudo: string;

  @Column({unique : true})
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isOnline: boolean;
}