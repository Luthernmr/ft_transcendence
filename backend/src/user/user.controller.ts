/*
https://docs.nestjs.com/controllers#controllers
*/
import { Request, Response} from 'express';
import { BadRequestException, Body, Controller, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from './user.service';
import JwtTwoFactorGuard from 'src/auth/twofa.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './user.entity';
import { diskStorage } from 'multer';
import { HistoryService } from 'src/pong/history.service';
import { request } from 'http';

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private historyService: HistoryService
	) { }

	@Get('all')
	@UseGuards(JwtTwoFactorGuard)
	async all(@Res() response: Response) {
		const users = await this.userService.getAllUser();
		const allUsers = { users: users }
		response.send(allUsers);
	}

	@Get(':id')
	@UseGuards(JwtTwoFactorGuard)
	async user(@Res() response: Response, @Param('id') id: number) {
		//console.log('here')
		const user = await this.userService.getUserById(id)
		delete user.password;
		//console.log('test', user)
		response.send({ user: user });
	}

	@Get('history/:id')
	@UseGuards()
	async history(@Res() response: Response, @Param('id') id: number) {
		try {
			//console.log('usi id request hystory',id);

			const user: any = await this.userService.getUserById(id);
			delete user.password;
			const history: any = await this.historyService.getUserHistory(user);
			//console.log('history', history);
			response.send({ history: history });
		} catch (error) {
			//console.log(error);
		}
	}

	@Post('settings')
	@UseGuards(JwtTwoFactorGuard)
	async settings(
		@Body('nickname') nickname: string,
		@Res({ passthrough: true }) response: Response,
		@Req() request: Request
	) {
		const user: any = request.user;
		if (!user)
			return ("no user");
		this.userService.changeNickname(user, nickname);
		return response.send({ user });
	}

	@Post('avatar')
	@UseGuards(JwtTwoFactorGuard)
	@UseInterceptors(FileInterceptor('file', {
		storage: diskStorage({
			destination: './uploadedFiles',
			filename(req, file, callback) {
				const name = file.originalname.split('.')[0];
				const fileExtension = file.originalname.split('.')[1];
				const newFileName = name.split(" ").join('_') + '_' + Date.now() + '.' + fileExtension;

				callback(null, newFileName);
			},
		}),
		fileFilter(req, file, callback) {
			if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
				return callback(null, false);
			}
			callback (null, true);
		}
	}))
	async addAvatar(@Req() request: Request, @UploadedFile() file: Express.Multer.File) {
		console.log(file);
		try {
			if (!file)
				throw new BadRequestException('File is not an image');
			else
			{
				const response = {
					filePath : `http://212.227.209.204:5000/user/avatars/${file.filename}`
				};
				const user: any = request.user;
				this.userService.changeImg(user, response.filePath)
				return response
			}
		} catch (error) {
			console .log(error)
		}
	}

	@Get('avatars/:filename')
	async getPicture(@Param('filename') filename : any, @Res() res: Response){
		res.sendFile(filename ,{root :'./uploadedFiles'})
	}

}
