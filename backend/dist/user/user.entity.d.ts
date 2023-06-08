import { Friend } from 'src/social/friend.entity';
import { PendingRequest } from 'src/social/pendingRequest.entity';
export declare class User {
    id: number;
    nickname: string;
    email: string;
    password: string;
    imgPdp: string;
    isOnline: boolean;
    socketId: string;
    friends: Friend[];
    pendingRequest: PendingRequest[];
}
