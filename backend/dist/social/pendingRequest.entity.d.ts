import { User } from 'src/user/user.entity';
export declare class PendingRequest {
    id: number;
    type: string;
    accepted: boolean;
    senderId: number;
    user: User;
}
