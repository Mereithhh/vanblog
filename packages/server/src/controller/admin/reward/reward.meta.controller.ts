import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RewardDto } from 'src/dto/reward.dto';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { MetaProvider } from 'src/provider/meta/meta.provider';
@ApiTags('reward')
@UseGuards(AdminGuard)
@Controller('/api/admin/meta/reward')
export class RewardMetaController {
  constructor(private readonly metaProvider: MetaProvider) {}

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
    const data = await this.metaProvider.addOrUpdateReward(updateDto);
    return {
      statusCode: 200,
      data,
    };
  }

  @Post()
  async create(@Body() updateDto: RewardDto) {
    const data = await this.metaProvider.addOrUpdateReward(updateDto);
    return {
      statusCode: 200,
      data,
    };
  }

  @Delete('/:name')
  async delete(@Param('name') name: string) {
    const data = await this.metaProvider.deleteReward(name);
    return {
      statusCode: 200,
      data,
    };
  }
}
