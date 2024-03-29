import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { User } from 'src/user/user.entity';
import { UserService } from '../user/user.service';
import { Socket } from 'socket.io';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}
  async login(user: User, response: Response): Promise<{ token: string }> {
    try {
      await this.userService.setOnline(user);
      const payload = {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        isOnline: user.isOnline,
        isTwoFa: user.isTwoFA,
      };
      const jwt = await this.jwtService.signAsync(payload);
      response.cookie('jwt', jwt, { httpOnly: true, sameSite: 'strict' });
      return { token: jwt };
    } catch (error) {
      return error;
    }
  }

  async loginTwoFa(
    user: User,
    response: Response,
    isSecondFactorAuthenticated = false,
  ) {
    try {
      await this.userService.setOnline(user);
      const payload = { id: user.id, isSecondFactorAuthenticated };
      const twofaToken = await this.jwtService.signAsync(payload);
      response.cookie('twofa', twofaToken, {
        httpOnly: true,
        sameSite: 'strict',
      });
    } catch (error) {
      return error;
    }
  }

  async setCookie(user: User, response: Response) {
    try {
      const payload = {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        isOnline: user.isOnline,
      };
      const jwt = await this.jwtService.signAsync(payload);
      response.cookie('jwt', jwt, { httpOnly: true, sameSite: 'strict' });
    } catch (error) {
      return error;
    }
  }

  async getUserCookie(request: Request): Promise<User> {
    try {
      const cookie = await request.cookies['jwt'];
      const data = await this.jwtService.verify(cookie);
      if (data) return await this.userService.getUser(data.email);
    } catch (error) {
      return error;
    }
  }

  async getUserByToken(token: string): Promise<User> {
    try {
      if (token) {
        const data = await this.jwtService.verify(token);
        const user: User = await this.userService.getUser(data.email);
        delete user?.password;
        return user;
      }
    } catch (error) {
      return error;
    }
  }
  async verifyJWT(token: string) {
    try {
      if (token) {
        const data = await this.jwtService.verify(token);
        if (!data) throw new UnauthorizedException('bad token');
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  async getUserSocket(server: any, userId: number): Promise<Socket> {
    try {
      let sockets = Array.from(await server.sockets);
      let otherSocket: Socket = null;
      for (const socket of sockets) {
        let token = (socket as any)[1].handshake.auth.token;
        if (!token) return null;
        const user: User = await this.getUserByToken(token);
        if (userId == user.id) otherSocket = socket[1];
      }
      if (otherSocket) return otherSocket;
    } catch (error) {
      return error;
    }
  }

  async AlreadyConnect(server: any, userId: number) {
    try {
      let sockets = Array.from(await server.sockets);
      let count = 0;
      for (const socket of sockets) {
        let token = (socket as any)[1].handshake.auth.token;
        if (!token) return null;
        const user: User = await this.getUserByToken(token);
        if (userId == user.id) {
          count++;
        }
      }
      if (count > 1) return true;
      return false;
    } catch (error) {
      return error;
    }
  }

  async logout(request: Request, response: Response) {
    try {
      const user = await this.getUserCookie(request);
      if (!user.id) throw new UnauthorizedException('failed to load user');
      await this.userService.setOffline(user);
      response.clearCookie('jwt');
    } catch (error) {}
  }
}
