import { UsersModule } from './module/users.module';
import { AuthModule } from './module/auth.module';
import { AuthController } from './controllers/auth.controller';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './socket/exception.filter';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/users.entity';
import { AuthService } from './services/auth.service';
@Module({
	imports: [
		UsersModule,
		AuthModule,
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'postgres',
			port: 5432,
			username: 'root',
			password: 'root',
			database: 'test_db',
			entities: [UserEntity],
			synchronize: true,
		}),
		TypeOrmModule.forFeature([UserEntity]),
	],
	controllers: [
		AuthController,
		AuthController, AppController],
	providers: [
		{
			provide: APP_FILTER,
			useClass: AllExceptionsFilter,
		}, AppService, AuthService,
})
export class AppModule { }
