import { User } from './user.entity';
import { Repository } from 'typeorm';
import { PendingRequest } from 'src/social/pendingRequest.entity';
export declare class UserService {
    private userRepository;
    private pendingRequest;
    constructor(userRepository: Repository<User>, pendingRequest: Repository<PendingRequest>);
    create(data: any): Promise<User>;
    getUser(email: any): Promise<User>;
    getAllUser(): Promise<any>;
    getUserById(id: number): Promise<User>;
    setSocket(id: number, socketId: string): Promise<void>;
    setOnline(user: User): Promise<void>;
    setOffline(user: User): Promise<void>;
    changeImg(user: User, img: string): Promise<void>;
    changeNickname(user: User, nickname: string): Promise<void>;
    createPendingRequest(data: any): Promise<PendingRequest>;
}
