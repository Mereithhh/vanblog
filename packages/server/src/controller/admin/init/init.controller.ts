import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InitDto } from 'src/dto/init.dto';
import { DraftProvider } from 'src/provider/draft/draft.provider';
import { InitProvider } from 'src/provider/init/init.provider';

@ApiTags('init')
@Controller('/api/admin')
export class DraftController {
  constructor(private readonly initProvider: InitProvider) {}

  @Post('/init')
  async initSystem(@Body() initDto: InitDto) {
    await this.initProvider.init(initDto);
    return {
      statusCode: 200,
      message: '初始化成功!',
    };
  }
}
