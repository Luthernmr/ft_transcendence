import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Friend } from './friend.entity';
export declare class FriendService {
    private friendRepository;
    private readonly userService;
    constructor(friendRepository: Repository<Friend>, userService: UserService);
    addFriend(id: number): Promise<any>;
    getFriendList(): Promise<any>;
}
