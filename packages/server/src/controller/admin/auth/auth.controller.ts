import {
  Controller,
  Request,
  Post,
  UseGuards,
  Put,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { config } from 'src/config/index';
import { UpdateUserDto } from 'src/types/user.dto';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { AuthProvider } from 'src/provider/auth/auth.provider';
import { LogProvider } from 'src/provider/log/log.provider';
import { UserProvider } from 'src/provider/user/user.provider';

@ApiTags('tag')
@Controller('/api/admin/auth/')
export class AuthController {
  constructor(
    private readonly authProvider: AuthProvider,
    private readonly userProvider: UserProvider,
    private readonly logProvider: LogProvider,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async login(@Request() request: any) {
    if (request?.user?.fail) {
      this.logProvider.login(request, false);
      throw new UnauthorizedException({
        statusCode: 401,
        message: '用户名或密码错误！',
      });
    }
    // 能到这里登陆就成功了
    this.logProvider.login(request, true);
    return {
      statusCode: 200,
      data: await this.authProvider.login(request.user),
    };
  }
  @UseGuards(AdminGuard)
  @Put()
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    if (config?.demo == true || config?.demo == 'true') {
      return { statusCode: 401, message: '演示站禁止修改账号密码！' };
    }
    return {
      statusCode: 200,
      data: await this.userProvider.updateUser(updateUserDto),
    };
  }
}
