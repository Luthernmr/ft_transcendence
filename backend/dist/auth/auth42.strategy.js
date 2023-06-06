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
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth42Strategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_42_1 = require("passport-42");
require("dotenv/config");
let auth42Strategy = class auth42Strategy extends (0, passport_1.PassportStrategy)(passport_42_1.Strategy, '42') {
    constructor() {
        console.log("test,", process.env.AUTHORIZATION_URL, process.env.TOKEN_URL, process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.CALLBACK_URL);
        super({
            authorizationURL: process.env.AUTHORIZATION_URL,
            tokenURL: process.env.TOKEN_URL,
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: 'http://212.227.209.204:3000/auth',
        });
    }
    validate(access_token, refresh_token, user) {
        return ({ access_token, user });
    }
};
auth42Strategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], auth42Strategy);
exports.auth42Strategy = auth42Strategy;
//# sourceMappingURL=auth42.strategy.js.map