import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestController } from './controllers/test.controller';
import { TestService } from './services/test.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'pg_container',
      port: 5432,
      username: 'root',
      password: 'root',
      database: 'test_db',
      entities: [],
      synchronize: true,
    }),
  ],
  controllers: [AppController, TestController],
  providers: [AppService, TestService],
})
export class AppModule {}
