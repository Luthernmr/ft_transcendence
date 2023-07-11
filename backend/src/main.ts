import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { Server } from 'socket.io';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: [process.env.FRONTEND as string, 'https://api.intra.42.fr/oauth/'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,

      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.BACKEND_PORT);
}
bootstrap();
