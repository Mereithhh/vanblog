import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { config } from 'src/config';

import { AdminGuard } from 'src/provider/auth/auth.guard';
import { MetaProvider } from 'src/provider/meta/meta.provider';
import { ApiToken } from 'src/provider/swagger/token';
import { TokenProvider } from 'src/provider/token/token.provider';

import { UserProvider } from 'src/provider/user/user.provider';
import { Collaborator } from 'src/types/collaborator';

@ApiTags('collaborator')
@UseGuards(...AdminGuard)
@ApiToken
@Controller('/api/admin/collaborator/')
export class CollaboratorController {
  constructor(
    private readonly userProvider: UserProvider,
    private readonly metaProvider: MetaProvider,
    private readonly tokenProvider: TokenProvider,
  ) {}
  @Get()
  async getAllCollaborators() {
    const data = await this.userProvider.getAllCollaborators();
    return {
      statusCode: 200,
      data: data || [],
    };
  }
  @Get('/list')
  async getAllCollaboratorsList() {
    // 管理员优先用作者名称吧
    const siteInfo = await this.metaProvider.getSiteInfo();
    const admin = await this.userProvider.getUser(true);
    const adminUser = {
      name: admin.name,
      nickname: siteInfo.author,
      id: 0,
    };
    const data = await this.userProvider.getAllCollaborators(true);
    return {
      statusCode: 200,
      data: [adminUser, ...data] || [adminUser],
    };
  }
  @Delete('/:id')
  async deleteCollaboratorById(@Param('id') id: number) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.userProvider.deleteCollaborator(id);
    await this.tokenProvider.disableAllCollaborator();
    return {
      statusCode: 200,
      data,
    };
  }
  @Post()
  async createCollaborator(@Body() dto: Collaborator) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.userProvider.createCollaborator(dto);
    return {
      statusCode: 200,
      data,
    };
  }
  @Put()
  async updateCollaborator(@Body() dto: Collaborator) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.userProvider.updateCollaborator(dto);
    await this.tokenProvider.disableAllCollaborator();
    return {
      statusCode: 200,
      data,
    };
  }
}
