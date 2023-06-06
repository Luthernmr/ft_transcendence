"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BddModule = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../user/user.entity");
const common_1 = require("@nestjs/common");
const friend_entity_1 = require("../social/friend.entity");
const pendingRequest_entity_1 = require("../social/pendingRequest.entity");
let BddModule = class BddModule {
};
BddModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: 'postgres',
                port: 5432,
                username: 'root',
                password: 'root',
                database: 'ft_db',
                entities: [user_entity_1.User, friend_entity_1.Friend, pendingRequest_entity_1.PendingRequest],
                synchronize: true,
            })
        ],
        controllers: [],
        providers: [],
    })
], BddModule);
exports.BddModule = BddModule;
//# sourceMappingURL=bdd.module.js.map