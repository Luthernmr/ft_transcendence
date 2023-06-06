"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const friend_module_1 = require("./social/friend.module");
const auth42_service_1 = require("./auth/auth42.service");
const socket_module_1 = require("./user/socket.module");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const common_1 = require("@nestjs/common");
const bdd_module_1 = require("./bdd/bdd.module");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [friend_module_1.FriendModule, user_module_1.UserModule, bdd_module_1.BddModule, auth_module_1.AuthModule, socket_module_1.SocketModule, config_1.ConfigModule.forRoot()],
        controllers: [],
        providers: [auth42_service_1.Auth42Service, jwt_1.JwtService]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map