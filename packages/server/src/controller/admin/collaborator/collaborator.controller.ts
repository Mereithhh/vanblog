import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { config } from 'src/config';

import { AdminGuard } from 'src/provider/auth/auth.guard';

import { UserProvider } from 'src/provider/user/user.provider';
import { Collaborator } from 'src/types/collaborator';

@ApiTags('collaborator')
@UseGuards(...AdminGuard)
@Controller('/api/admin/collaborator/')
export class CollaboratorController {
  constructor(private readonly userProvider: UserProvider) {}
  @Get()
  async getAllCollaborators() {
    const data = await this.userProvider.getAllCollaborators();
    return {
      statusCode: 200,
      data: data || [],
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
    return {
      statusCode: 200,
      data,
    };
  }
}
