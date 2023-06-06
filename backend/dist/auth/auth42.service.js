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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth42Service = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
let Auth42Service = class Auth42Service {
    constructor(userService, jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async login(request) {
        var user = await this.userService.getUser(request.user._json.email);
        if (!user) {
            user = await this.userService.create({
                nickname: request.user._json.login,
                email: request.user._json.email,
                imgPdp: request.user._json.image.link,
                isOnline: false
            });
        }
        await this.userService.setOnline(user);
        const payload = { id: user.id, nickname: user.nickname, email: user.email, isOnline: user.isOnline };
        const jwt = await this.jwtService.signAsync(payload);
        return jwt;
    }
};
Auth42Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService, typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object])
], Auth42Service);
exports.Auth42Service = Auth42Service;
//# sourceMappingURL=auth42.service.js.map