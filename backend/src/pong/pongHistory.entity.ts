import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from 'src/user/user.entity';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';

@Entity('history')
export class PongHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinTable()
  user1: User;

  @ManyToOne(() => User)
  @JoinTable()
  user2: User;

  @Column()
  winner: number;

  @Column({nullable : true})
  scoreUser1: number;

  @Column({nullable : true})
  scoreUser2: number;

  @Column({default: false})
  customMode: boolean;
}