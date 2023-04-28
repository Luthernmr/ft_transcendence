import { AuthModule } from './Modules/auth.module';
import { UserModule } from './Modules/user.module';
import { AuthService } from './Services/auth.service';
import { UserService } from './Services/user.service';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BddModule } from './Modules/bdd.module';

@Module({
	imports: [
		AuthModule,
		UserModule, BddModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule { }
