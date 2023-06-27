
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
 
@Injectable()
export default class JwtTwoFactorGuard extends AuthGuard('jwt-two-factor') {

}