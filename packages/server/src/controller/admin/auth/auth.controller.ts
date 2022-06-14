import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AuthProvider } from 'src/provider/auth/auth.provider';

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
