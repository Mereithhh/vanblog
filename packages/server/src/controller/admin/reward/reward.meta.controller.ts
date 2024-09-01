import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RewardDto } from 'src/types/reward.dto';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { ISRProvider } from 'src/provider/isr/isr.provider';
import { MetaProvider } from 'src/provider/meta/meta.provider';
import { config } from 'src/config';
import { ApiToken } from 'src/provider/swagger/token';
@ApiTags('reward')
@UseGuards(...AdminGuard)
@ApiToken
@Controller('/api/admin/meta/reward')
export class RewardMetaController {
  constructor(
    private readonly metaProvider: MetaProvider,
    private readonly isrProvider: ISRProvider,
  ) {}

  @Get()
  async get() {
    const data = await this.metaProvider.getRewards();
    return {
      statusCode: 200,
      data,
    };
  }

  @Put()
  async update(@Body() updateDto: RewardDto) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.metaProvider.addOrUpdateReward(updateDto);
    this.isrProvider.activeAbout('更新打赏信息触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }

  @Post()
  async create(@Body() updateDto: RewardDto) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.metaProvider.addOrUpdateReward(updateDto);
    this.isrProvider.activeAbout('新建打赏信息触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }

  @Delete('/:name')
  async delete(@Param('name') name: string) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.metaProvider.deleteReward(name);
    this.isrProvider.activeAbout('删除打赏信息触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }
}
