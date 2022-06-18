import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { ApiTags } from '@nestjs/swagger';
import { InitDto } from 'src/dto/init.dto';
import { InitProvider } from 'src/provider/init/init.provider';

@ApiTags('init')
@Controller('/api/admin')
export class InitController {
  constructor(private readonly initProvider: InitProvider) {}

  @Post('/init')
  async initSystem(@Body() initDto: InitDto) {
    const hasInit = await this.initProvider.checkHasInited();
    if (hasInit) {
      throw new HttpException('已初始化', 500);
    }
    await this.initProvider.init(initDto);
    return {
      statusCode: 200,
      message: '初始化成功!',
    };
  }
}
