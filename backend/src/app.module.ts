import { SocketModule } from './Modules/socket.module';
import { TestGateway } from './Gateway/test.gateway';
import { AuthModule } from './Modules/auth.module';
import { UserModule } from './Modules/user.module';
import { AuthService } from './Services/auth.service';
import { Module } from '@nestjs/common';
import { BddModule } from './Modules/bdd.module';

@Module({
	imports: [
		SocketModule, UserModule, BddModule, AuthModule],
	controllers: [],
	providers: [
		TestGateway,],
})
export class AppModule { }
