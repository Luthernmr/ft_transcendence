import { Friend } from 'src/social/friend.entity';
export declare class User {
    id: number;
    nickname: string;
    email: string;
    password: string;
    imgPdp: string;
    isOnline: boolean;
    socketId: string;
    friends: Friend[];
}
