import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { ISRProvider } from 'src/provider/isr/isr.provider';
import { MetaProvider } from 'src/provider/meta/meta.provider';

@ApiTags('about')
@UseGuards(AdminGuard)
@Controller('/api/admin/meta/about')
export class AboutMetaController {
  constructor(
    private readonly metaProvider: MetaProvider,
    private readonly isrProvider: ISRProvider,
  ) {}

  @Get()
  async getAbout() {
    const data = await this.metaProvider.getAbout();
    return {
      statusCode: 200,
      data,
    };
  }

  @Put()
  async updateAbout(@Body() updateAboutDto: { content: string }) {
    const data = await this.metaProvider.updateAbout(updateAboutDto.content);
    this.isrProvider.activeAbout('更新 about 触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }
}
