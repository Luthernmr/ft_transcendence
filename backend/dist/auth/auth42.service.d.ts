import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
export declare class Auth42Service {
    private readonly userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    login(request: any): Promise<any>;
}
