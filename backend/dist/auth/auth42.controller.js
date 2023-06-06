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
exports.Auth42Controller = void 0;
const common_1 = require("@nestjs/common");
const auth42_guard_1 = require("./auth42.guard");
const auth42_service_1 = require("./auth42.service");
let Auth42Controller = class Auth42Controller {
    constructor(auth42Service) {
        this.auth42Service = auth42Service;
    }
    async login42(response, request) {
        let token = await this.auth42Service.login(request.user);
        response.cookie('jwt', token, { httpOnly: true });
        return ({ jwt: token });
    }
};
__decorate([
    (0, common_1.Get)('42'),
    (0, common_1.UseGuards)(auth42_guard_1.auth42Guard),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], Auth42Controller.prototype, "login42", null);
Auth42Controller = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth42_service_1.Auth42Service])
], Auth42Controller);
exports.Auth42Controller = Auth42Controller;
//# sourceMappingURL=auth42.controller.js.map