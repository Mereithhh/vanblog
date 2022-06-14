import { Controller, Request, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from 'src/dto/user.dto';
import { AuthProvider } from 'src/provider/auth/auth.provider';
import { UserProvider } from 'src/provider/user/user.provider';
@ApiTags('tag')
@Controller('/api/admin/auth/')
export class AuthController {
  constructor(private readonly authProvider: AuthProvider) {}

  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async login(@Request() request) {
    return {
      statusCode: 200,
      data: await this.authProvider.login(request.user),
    };
  }
}
