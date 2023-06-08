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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./user.entity");
const typeorm_2 = require("typeorm");
const pendingRequest_entity_1 = require("../social/pendingRequest.entity");
let UserService = class UserService {
    constructor(userRepository, pendingRequest) {
        this.userRepository = userRepository;
        this.pendingRequest = pendingRequest;
    }
    async create(data) {
        return this.userRepository.save(data);
    }
    async getUser(email) {
        return this.userRepository.findOne({ where: { email: email } });
    }
    async getAllUser() {
        const users = await this.userRepository.find();
        return users;
    }
    async getUserById(id) {
        return await this.userRepository.findOne({ where: { id: id } });
    }
    async setSocket(id, socketId) {
        var user = await this.getUserById(id);
        console.log('test', user.nickname);
        user.socketId = socketId;
        await this.userRepository.save(user);
    }
    async setOnline(user) {
        user.isOnline = true;
        await this.userRepository.save(user);
    }
    async setOffline(user) {
        user.isOnline = false;
        await this.userRepository.save(user);
    }
    async changeImg(user, img) {
        user.imgPdp = img;
        await this.userRepository.save(user);
    }
    async changeNickname(user, nickname) {
        user.nickname = nickname;
        await this.userRepository.save(user);
    }
    async createPendingRequest(data) {
        return await this.pendingRequest.save(data);
    }
    async getAllPendingRequest() {
        const pendingRequests = await this.pendingRequest.find();
        return pendingRequests;
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(pendingRequest_entity_1.PendingRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map