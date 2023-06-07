"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const user_service_1 = require("./user.service");
const class_validator_1 = require("class-validator");
require("dotenv/config");
let SocketGateway = class SocketGateway {
    constructor(userService) {
        this.userService = userService;
    }
    async handleConnection(client) {
        console.log("token", console.log(client.handshake.auth.token));
        console.log("connected socket id : ", client.id);
    }
    handleDisconnect(client) {
        console.log("disconnected socket id : ", client.id);
    }
    afterInit(server) {
        console.log('Socket is live');
    }
    async Friend(client, data) {
        console.log('friendRequest : ', data.userSenderId, data.userReceiveId, client.id);
        const userReceiv = await this.userService.getUserById(data.userReceiveId);
        const otherId = userReceiv.socketId;
        const request = await this.userService.createPendingRequest({
            type: "friend",
            senderId: data.userSenderId,
        });
        client.to(otherId).emit('pendingRequest', request);
    }
    acceptFriendRequest(data) {
        if (class_validator_1.validate)
            console.log('accepted');
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('friendRequest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "Friend", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('acceptFriendRequest'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "acceptFriendRequest", null);
SocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: process.env.FRONTEND } }),
    __metadata("design:paramtypes", [user_service_1.UserService])
], SocketGateway);
exports.SocketGateway = SocketGateway;
//# sourceMappingURL=socket.gateway.js.map