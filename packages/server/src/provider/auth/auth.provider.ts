import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto, UpdateUserDto } from 'src/dto/user.dto';
import { User, UserDocument } from 'src/scheme/user.schema';
import { UserProvider } from '../user/user.provider';

@Injectable()
export class AuthProvider {
  constructor(
    private readonly usersService: UserProvider,
    private readonly jwtService: JwtService,
  ) {}
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.getUser();
    if (user && user.password === pass && user.name === username) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { username: user.name, sub: user.id };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
