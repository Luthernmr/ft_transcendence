import { User } from 'src/user/user.entity';
import { Entity, PrimaryGeneratedColumn, JoinTable, ManyToOne } from 'typeorm';

@Entity('friend')
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.friends)
  @JoinTable()
  userA: User;

  @ManyToOne(() => User, (user) => user.friends)
  @JoinTable()
  userB: User;
}
