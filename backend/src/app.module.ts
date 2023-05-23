import { SocketGateway } from './Socket/socket.gateway';
import { SocketModule } from './Socket/socket.module';
import { AuthModule } from './Modules/auth.module';
import { UserModule } from './Modules/user.module';
import { AuthService } from './Services/auth.service';
import { Module } from '@nestjs/common';
import { BddModule } from './Modules/bdd.module';

@Module({
	imports: [UserModule, BddModule, AuthModule, SocketModule],
	controllers: [],
	providers: []
})
export class AppModule { }
