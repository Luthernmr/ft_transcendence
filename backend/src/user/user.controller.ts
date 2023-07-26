import { Request, Response } from 'express';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationError,
} from '@nestjs/common';
import { UserService } from './user.service';
import JwtTwoFactorGuard from 'src/auth/twofa.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { HistoryService } from 'src/pong/history.service';
import * as fs from 'fs';
import * as path from 'path';
import { plainToClass } from 'class-transformer';
import { NicknameDto, TwoFaCodeDto } from './user.dto';
import { validateOrReject } from 'class-validator';


@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private historyService: HistoryService,
  ) {}

  @Get('all')
  @UseGuards(JwtTwoFactorGuard)
  async all(@Res() response: Response) {
	try {
		const users = await this.userService.getAllUser();
		const allUsers = { users: users };
		response.send(allUsers);
		
	} catch (error) {
		
	}
  }

  @Get(':id')
  @UseGuards(JwtTwoFactorGuard)
  async user(@Res() response: Response, @Param('id') id: number) {
	try {
		const user = await this.userService.getUserById(id);
		delete user.password;
		response.send({ user: user });
		
	} catch (error) {
		
	}
  }

  @Get('history/:id')
  @UseGuards(JwtTwoFactorGuard)
  async history(@Res() response: Response, @Param('id') id: number) {
    try {
      const user: any = await this.userService.getUserById(id);
      delete user.password;
      const history: any = await this.historyService.getUserHistory(user);

      response.send({ history: history });
    } catch (error) {}
  }

  @Get('stats/:id')
  @UseGuards(JwtTwoFactorGuard)
  async stats(@Res() response: Response, @Param('id') id: number) {
    try {
      const user: any = await this.userService.getUserById(id);
      delete user.password;
      const historys = await this.historyService.getUserHistory(user);
      let nbOfGame = historys.length;
      let nbOfWin = 0;
      let nbOfLoose = 0;

      let pointTab = [];
      let oponentTab = [];
      let matchList = [];
      let winrate = 0;
      for (let i = 0; i < historys.length; i++) {
        matchList.push(i + 1);
        pointTab.push(historys[i].myScore);
        oponentTab.push(historys[i].opponentScore);
        if (historys[i].winner) nbOfWin++;
        else nbOfLoose++;
      }
      winrate = Math.round((nbOfWin / nbOfGame) * 100);
      const stats = {
        nbOfGame: nbOfGame,
        nbOfWin: nbOfWin,
        nbOfLoose: nbOfLoose,
        pointTab: pointTab,
        matchList: matchList,
        oponentTab: oponentTab,
        winrate: winrate,
      };
      response.send({ stats: stats });
    } catch (error) {}
  }

  @Post('settings')
  @UseGuards(JwtTwoFactorGuard)
  async settings(
    @Body() data : any,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    try {
		const dto = plainToClass(NicknameDto, data);
		await validateOrReject(dto).catch((errors: ValidationError[]) => {
			throw new BadRequestException(errors);
		  });
      const user: any = request.user;
      if (!user)
	  	return 'no user';
      await this.userService.changeNickname(user, dto.nickname);
      response.send({ user });
    } catch (error) {
		return error;
	}
  }

  @Post('avatar')
  @UseGuards(JwtTwoFactorGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploadedFiles',
        filename(req, file, callback) {
          const name = file.originalname.split('.')[0];
          const fileExtension = file.originalname.split('.')[1];
          const newFileName =
            name.split(' ').join('_') + '_' + Date.now() + '.' + fileExtension;

          callback(null, newFileName);
        },
      }),
      fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(null, false);
        }
        callback(null, true);
      },
    }),
  )
  async addAvatar(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('File is not an image');
      } else {
        const response = {
          filePath: `${process.env.BACKEND}/user/avatars/${file.filename}`,
        };
        const user: any = request.user;
        if (user.imgPdp) {
          const oldFilePath = user.imgPdp;
          let split = oldFilePath.split('/');
          try {
            if (oldFilePath) {
              fs.unlinkSync(`./uploadedFiles/${split[5]}`);
            }
          } catch (error) {
            console.error(
              "Erreur lors de la suppression de l'ancienne image :",
              error,
            );
          }
        }
        await this.userService.changeImg(user, response.filePath);
        return response;
      }
    } catch (error) {
	}
  }

  @Get('avatars/:filename')
  @UseGuards(JwtTwoFactorGuard)
  async getPicture(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join('./uploadedFiles', filename);
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
      } else {
        res.sendFile(filename, {root : "./uploadedFiles"});
      }
    });
  }
}
