import { Message } from 'src/message/entities/message.entity';
import { MutedUser } from '../room/entities/muted-user.entity';
import { Room } from 'src/room/entities/room.entity';
import { BlockedUser } from 'src/social/blockedUser.entity';
import { Friend } from 'src/social/friend.entity';
import { PendingRequest } from 'src/social/pendingRequest.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nickname: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  imgPdp: string;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ default: false })
  isPlaying: boolean;

  @Column({ nullable: true })
  socketId: string;

  @Column({ nullable: true })
  twoFASecret: string;

  @Column({ nullable: true, default: false })
  isTwoFA: boolean;

  @OneToMany(() => Friend, (friend) => friend.userA)
  @JoinTable()
  friends: Friend[];

  @OneToMany(() => PendingRequest, (pendingRequest) => pendingRequest.user)
  @JoinTable()
  pendingRequests: PendingRequest[];

  @OneToMany(() => BlockedUser, (friend) => friend.currentUser)
  @JoinTable()
  blockedUsers: BlockedUser[];

  @ManyToMany(() => Room, (room: Room) => room.users)
  rooms: Room[];

  @ManyToMany(() => Room, (room: Room) => room.bannedUsers, { eager: true })
  bannedRooms: Room[];

  @ManyToMany(() => Room, (room: Room) => room.admins)
  adminRooms: Room[];

  @OneToMany(() => MutedUser, (mutedUser) => mutedUser.user)
  mutedUsers: MutedUser[];

  @OneToMany(() => Message, (message: Message) => message.user)
  messages: Array<Message>;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @Column({ default: 0 })
  ratioToNextLevel: number;
}
