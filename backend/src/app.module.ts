import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestController } from './controllers/test.controller';
import { TestService } from './services/test.service';
import { TestGateway } from './services/test/test.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'root',
      password: 'root',
      database: 'test_db',
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AppController, TestController],
  providers: [AppService, TestService, TestGateway],
})
export class AppModule {}
