import { User } from 'src/user/user.entity';
export declare class Friend {
    id: number;
    name: string;
    img: string;
    blocked: boolean;
    user: User[];
}
