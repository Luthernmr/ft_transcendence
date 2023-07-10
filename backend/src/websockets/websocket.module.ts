import { Module } from '@nestjs/common';
import { GlobalGateway } from './global.gateway';

@Module({
  providers: [GlobalGateway],
  exports: [GlobalGateway],
})
export class WebsocketModule {}
