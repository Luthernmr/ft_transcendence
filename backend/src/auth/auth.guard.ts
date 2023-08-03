import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ReturnDocument } from 'typeorm';

@Injectable()
export class LocalAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const cookie = request?.cookies['jwt'];
      if (!cookie)
        return false
      const data = this.jwtService.verifyAsync(cookie);
      if (!data)
	  	return false;
    } catch (error) {
      return false;
    }
    return true;
  }
}
