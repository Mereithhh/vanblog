import {
  Controller,
  UseGuards,
  Logger,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { config } from 'src/config';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { CustomPageProvider } from 'src/provider/customPage/customPage.provider';
import { StaticProvider } from 'src/provider/static/static.provider';
import { ApiToken } from 'src/provider/swagger/token';
import { CustomPage } from 'src/scheme/customPage.schema';

@ApiTags('customPage')
@UseGuards(...AdminGuard)
@ApiToken
@Controller('/api/admin/customPage')
export class CustomPageController {
  private readonly logger = new Logger(CustomPageController.name);
  constructor(
    private readonly customPageProvider: CustomPageProvider,
    private readonly staticProvider: StaticProvider,
  ) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: any,
    @Query('path') path: string,
    @Query('name') name: string,
  ) {
    this.logger.log(`上传自定义页面文件：${path}\t ${name}`);
    file.originalname = name;
    const res = await this.staticProvider.upload(file, 'customPage', false, path);
    return {
      statusCode: 200,
      data: res,
    };
  }

  @Get('/all')
  async getAll() {
    return {
      statusCode: 200,
      data: await this.customPageProvider.getAll(),
    };
  }
  @Get('/folder')
  async getFolderFiles(@Query('path') path: string) {
    return {
      statusCode: 200,
      data: await this.staticProvider.getFolderFiles(path),
    };
  }
  @Get('/file')
  async getFileData(@Query('path') path: string, @Query('key') subPath: string) {
    return {
      statusCode: 200,
      data: await this.staticProvider.getFileContent(path, subPath),
    };
  }
  @Get()
  async getOneByPath(@Query('path') path: string) {
    return {
      statusCode: 200,
      data: await this.customPageProvider.getCustomPageByPath(path),
    };
  }
  @Post()
  async createOne(@Body() dto: CustomPage) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.customPageProvider.createCustomPage(dto);
    return {
      statusCode: 200,
      data,
    };
  }
  @Post('file')
  async createFile(@Query('path') pathname: string, @Query('subPath') subPath: string) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.staticProvider.createFile(pathname, subPath);
    return {
      statusCode: 200,
      data,
    };
  }
  @Post('folder')
  async createFolder(@Query('path') pathname: string, @Query('subPath') subPath: string) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.staticProvider.createFolder(pathname, subPath);
    return {
      statusCode: 200,
      data,
    };
  }

  @Put('file')
  async updateFileInFolder(@Body() dto: { filePath: string; pathname: string; content: string }) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }

    const data = await this.staticProvider.updateCustomPageFileContent(
      dto.pathname,
      dto.filePath,
      dto.content,
    );
    return {
      statusCode: 200,
      data,
    };
  }
  @Put()
  async updateOne(@Body() dto: CustomPage) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.customPageProvider.updateCustomPage(dto);
    return {
      statusCode: 200,
      data,
    };
  }
  @Delete()
  async deleteOne(@Query('path') path: string) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const toDelete = await this.customPageProvider.getCustomPageByPath(path);
    if (toDelete && toDelete.type == 'folder') {
      await this.staticProvider.deleteCustomPage(path);
    }
    const data = await this.customPageProvider.deleteByPath(path);
    return {
      statusCode: 200,
      data,
    };
  }
}
