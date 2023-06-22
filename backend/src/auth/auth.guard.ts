/*
https://docs.nestjs.com/guards#guards
*/

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private jwtService: JwtService) { }
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {

		try {
				const request = context.switchToHttp().getRequest();
				const cookie = request.cookies['jwt'];
				const data = this.jwtService.verifyAsync(cookie);
				if (!data)
					return(false)
				
		}
		catch(error)
		{
			console.log("You can't pass this guard looser",error)
			return (false)
		}
		console.log('The mission is a success')
		return true;
	}
}
