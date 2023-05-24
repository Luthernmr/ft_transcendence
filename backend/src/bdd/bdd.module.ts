/*
https://docs.nestjs.com/modules
*/
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity'

import { Module } from '@nestjs/common';
import { Friend } from 'src/social/friend.entiy';

@Module({
   		imports: [TypeOrmModule.forRoot({
		type: 'postgres',
		host: 'postgres',
		port: 5432,
		username: 'root',
		password: 'root',
		database: 'ft_db',
		entities: [User,Friend],
		synchronize: true,
	})
	],
    controllers: [],
    providers: [],
})
export class BddModule {}
