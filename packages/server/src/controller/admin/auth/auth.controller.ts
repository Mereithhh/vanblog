import {
  Controller,
  Request,
  Post,
  UseGuards,
  Put,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from 'src/dto/user.dto';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { AuthProvider } from 'src/provider/auth/auth.provider';
import { UserProvider } from 'src/provider/user/user.provider';

@ApiTags('tag')
@Controller('/api/admin/auth/')
export class AuthController {
  constructor(
    private readonly authProvider: AuthProvider,
    private readonly userProvider: UserProvider,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async login(@Request() request) {
    return {
      statusCode: 200,
      data: await this.authProvider.login(request.user),
    };
  }
  @UseGuards(AdminGuard)
  @Put()
  async updateUser(@Body() updateUserDto: UpdateUserDto) {
    return {
      statusCode: 200,
      data: await this.userProvider.updateUser(updateUserDto),
    };
  }
}
