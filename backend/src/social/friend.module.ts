import { UserModule } from 'src/user/user.module';
import { FriendService } from './friend.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from './friend.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Friend]), UserModule, AuthModule],
  providers: [FriendService],
  exports: [FriendService],
})
export class FriendModule {}
