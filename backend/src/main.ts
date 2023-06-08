import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import { ValidationPipe } from '@nestjs/common';
import { Server } from "socket.io";
import 'dotenv/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
	app.use(cookieParser());

	console.log("FRONTEND: " + process.env.FRONTEND);
	app.enableCors({
			 origin : [process.env.FRONTEND as string, 'https://api.intra.42.fr/oauth/'],
		 	 credentials : true
		})
		app.useGlobalPipes(new ValidationPipe({
			  // retire tout les champs qui ne sont pas déclaré dans la dto
		  whitelist: true,
		  transform: true,
		  // rejette les requêtes qui contiennent des champs non déclaré dans la dto
		 forbidNonWhitelisted: true, 
		}));

	await app.listen(5001);
}
bootstrap();