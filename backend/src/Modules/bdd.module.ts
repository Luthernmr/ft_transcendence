/*
https://docs.nestjs.com/modules
*/
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../Entities/user.entity'

import { Module } from '@nestjs/common';

@Module({
   		imports: [TypeOrmModule.forRoot({
		type: 'postgres',
		host: 'postgres',
		port: 5432,
		username: 'root',
		password: 'root',
		database: 'ft_db',
		entities: [User],
		synchronize: true,
	})
	],
    controllers: [],
    providers: [],
})
export class BddModule {}
