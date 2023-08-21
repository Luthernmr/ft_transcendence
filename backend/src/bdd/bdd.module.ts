import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Module } from '@nestjs/common';
import { Friend } from 'src/social/friend.entity';
import { PendingRequest } from 'src/social/pendingRequest.entity';
import { BlockedUser } from 'src/social/blockedUser.entity';
import { Room } from 'src/room/entities/room.entity';
import { Message } from 'src/message/entities/message.entity';
import { PongHistory } from 'src/pong/pongHistory.entity';
import { MutedUser } from 'src/room/entities/muted-user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: process.env.POSTGRES_USER,
      password:process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [
        User,
        MutedUser,
        Friend,
        PendingRequest,
        BlockedUser,
        Room,
        Message,
        PongHistory,
      ],
      synchronize: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class BddModule {}