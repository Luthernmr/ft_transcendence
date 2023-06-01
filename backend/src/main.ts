import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const cors = require('cors')

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors( {
    origin: ['http://localhost:3000'],
  })
  await app.listen(5000);
}
bootstrap();
