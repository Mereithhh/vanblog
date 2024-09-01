import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { Request } from 'express';
import { PipelineProvider } from 'src/provider/pipeline/pipeline.provider';
import { CreatePipelineDto } from 'src/types/pipeline.dto';
import { VanblogSystemEvents } from 'src/types/event';
import { ApiToken } from 'src/provider/swagger/token';

@ApiTags('pipeline')
@UseGuards(...AdminGuard)
@ApiToken
@Controller('/api/admin/pipeline')
export class PipelineController {
  constructor(private readonly pipelineProvider: PipelineProvider) {}
  @Get()
  async getAllPipelines(@Req() req: Request) {
    const pipelines = await this.pipelineProvider.getAll();
    return {
      statusCode: 200,
      data: pipelines,
    };
  }
  @Get('config')
  async getPipelineConfig(@Req() req: Request) {
    return {
      statusCode: 200,
      data: VanblogSystemEvents,
    };
  }
  @Get('/:id')
  async getPipelineById(@Param('id') idString: string) {
    const id = parseInt(idString);
    const pipeline = await this.pipelineProvider.getPipelineById(id);
    return {
      statusCode: 200,
      data: pipeline,
    };
  }
  @Post()
  async createPipeline(@Body() createPipelineDto: CreatePipelineDto) {
    const pipeline = await this.pipelineProvider.createPipeline(createPipelineDto);
    return {
      statusCode: 200,
      data: pipeline,
    };
  }
  @Delete('/:id')
  async deletePipelineById(@Param('id') idString: string) {
    const id = parseInt(idString);
    const pipeline = await this.pipelineProvider.deletePipelineById(id);
    return {
      statusCode: 200,
      data: pipeline,
    };
  }
  @Put('/:id')
  async updatePipelineById(
    @Param('id') idString: string,
    @Body() updatePipelineDto: CreatePipelineDto,
  ) {
    const id = parseInt(idString);
    const pipeline = await this.pipelineProvider.updatePipelineById(id, updatePipelineDto);
    return {
      statusCode: 200,
      data: pipeline,
    };
  }
  @Post('/trigger/:id')
  async triggerPipelineById(@Param('id') idString: string, @Body() triggerDto: { input?: any }) {
    const id = parseInt(idString);
    const result = await this.pipelineProvider.triggerById(id, triggerDto.input);
    return {
      statusCode: 200,
      data: result,
    };
  }
}
