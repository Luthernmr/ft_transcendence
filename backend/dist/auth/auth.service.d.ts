import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { User } from 'src/user/user.entity';
import { UserService } from '../user/user.service';
export declare class AuthService {
    private readonly userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    login(user: User, response: Response): Promise<any>;
    getUserCookie(request: Request): Promise<User>;
    logout(request: Request, response: Response): Promise<any>;
}
