import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PongHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user1ID: number;

  @Column()
  user2ID: number;

  @Column()
  scoreUser1: number;

  @Column()
  scoreUser2: number;

  @Column({default: false})
  customMode: boolean;
}