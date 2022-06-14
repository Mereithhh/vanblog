import { Body, Controller, Post } from '@nestjs/common';
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
      throw '已初始化!';
    }
    await this.initProvider.init(initDto);
    return {
      statusCode: 200,
      message: '初始化成功!',
    };
  }
}
