import { Message } from 'src/room/entities/message.entity';
import { Room } from 'src/room/entities/room.entity';
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

  @OneToMany(() => Friend, friend => friend.userA)
  @JoinTable()
  friends: Friend[];

  @OneToMany(() => PendingRequest, pendingRequest => pendingRequest.user)
  @JoinTable()
  pendingRequests: PendingRequest[];

//  @JoinTable()
//  @ManyToOne(() => Room, (room: Room) => room.users)
//  room: Room;

//  @JoinTable()
//  @ManyToMany(() => Room, (room: Room) => room.bannedUsers, { eager: true })
//  bannedRooms: Array<Room>;

//  @OneToMany(() => Message, (message: Message) => message.user)
//  messages: Array<Message>;
}