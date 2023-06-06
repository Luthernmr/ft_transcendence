import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from "socket.io";
import { UserService } from './user.service';
import 'dotenv/config';
export declare class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly userService;
    server: Server;
    constructor(userService: UserService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    afterInit(server: Socket): void;
    Friend(client: Socket, data: {
        userSenderId: any;
        userReceiveId: any;
    }): Promise<void>;
    acceptFriendRequest(data: {
        validate: any;
        userSenderId: any;
        userReceiveId: any;
    }): void;
}
