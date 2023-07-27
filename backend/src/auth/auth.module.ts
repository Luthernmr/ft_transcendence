import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserModule } from '../user/user.module';
import { auth42Strategy } from './auth42.strategy';
import { Auth42Service } from './auth42.service';
import { Auth42Controller } from './auth42.controller';
import { TwoFAService } from './twofa.service';
import { JwtTwoFactorStrategy } from './twofa.strategy';
import JwtTwoFactorGuard from './twofa.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: { expiresIn: '999d' },
    }),
    UserModule,
  ],
  controllers: [AuthController, Auth42Controller],
  providers: [
    auth42Strategy,
    AuthService,
    Auth42Service,
    TwoFAService,
    JwtTwoFactorStrategy,
    JwtTwoFactorGuard,
  ],
  exports: [AuthService, Auth42Service],
})
export class AuthModule {}
