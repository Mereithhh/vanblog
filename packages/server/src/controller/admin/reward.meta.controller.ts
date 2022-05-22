import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { LinkDto } from 'src/dto/link.dto';
import { RewardDto } from 'src/dto/reward.dto';
import { SocialDto, SocialType } from 'src/dto/social.dto';
import { AritcleProvider } from 'src/provider/article.provider';
import { CategoryProvider } from 'src/provider/category.provider';
import { MetaProvider } from 'src/provider/meta.provider';
import { TagProvider } from 'src/provider/tag.provider';

@Controller('/api/admin/meta/reward')
export class RewardMetaController {
  constructor(
    private readonly articleProvider: AritcleProvider,
    private readonly categoryProvider: CategoryProvider,
    private readonly tagProvider: TagProvider,
    private readonly metaProvider: MetaProvider,
  ) {}

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
