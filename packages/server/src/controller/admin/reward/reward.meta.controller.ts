import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RewardDto } from 'src/dto/reward.dto';
import { MetaProvider } from 'src/provider/meta/meta.provider';
@ApiTags('reward')
@Controller('/api/admin/meta/reward')
export class RewardMetaController {
  constructor(private readonly metaProvider: MetaProvider) {}

  @Get()
  async get() {
    return await this.metaProvider.getRewards();
  }

  @Put()
  async update(@Body() updateDto: RewardDto) {
    return await this.metaProvider.addOrUpdateReward(updateDto);
  }

  @Post()
  async create(@Body() updateDto: RewardDto) {
    return await this.metaProvider.addOrUpdateReward(updateDto);
  }

  @Delete('/:name')
  async delete(@Param('name') name: string) {
    return await this.metaProvider.deleteReward(name);
  }
}
