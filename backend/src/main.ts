import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(cookieParser());
  app.enableCors({
	  origin : 'http://212.227.209.204:3000',
	  credentials : true
	})
	app.useGlobalPipes(new ValidationPipe({
	  // retire tout les champs qui ne sont pas déclaré dans la dto
	  whitelist: true,
	  transform: true,
	  // rejette les requêtes qui contiennent des champs non déclaré dans la dto
	 forbidNonWhitelisted: true, 
	}));
  await app.listen(5000);
}
bootstrap();
