import { UserService } from 'src/user/user.service';
export declare class FriendController {
    private readonly userService;
    constructor(userService: UserService);
    addFriend(id: number): Promise<void>;
    allRequest(: any): any;
}
