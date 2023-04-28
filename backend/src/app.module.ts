import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './Entities/user.entity'

@Module({
  imports: [
	TypeOrmModule.forRoot({
		type: 'postgres',
		host: 'postgres',
		port: 5432,
		username: 'root',
		password: 'root',
		database: 'ft_db',
		entities: [User],
		synchronize: true,
	  }),
	  TypeOrmModule.forFeature([User])
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
