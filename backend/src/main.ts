import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
 app.use(cookieParser());
  app.enableCors({
	origin : 'http://212.227.209.204:3000',
	credentials : true
  })
  await app.listen(5000);
}
bootstrap();
