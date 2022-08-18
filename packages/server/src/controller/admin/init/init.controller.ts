import {
  Body,
  Controller,
  HttpException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { InitDto } from 'src/dto/init.dto';
import { InitProvider } from 'src/provider/init/init.provider';
import { StaticProvider } from 'src/provider/static/static.provider';

@ApiTags('init')
@Controller('/api/admin')
export class InitController {
  constructor(
    private readonly initProvider: InitProvider,
    private readonly staticProvider: StaticProvider,
  ) {}

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

  @Post('/init/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImg(@UploadedFile() file: any) {
    const hasInit = await this.initProvider.checkHasInited();
    if (hasInit) {
      throw new HttpException('已初始化', 500);
    }

    const res = await this.staticProvider.upload(file, 'img');
    return {
      statusCode: 200,
      data: res,
    };
  }
}
