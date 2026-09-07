import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { SearchStaticOption } from 'src/types/setting.dto';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { StaticProvider } from 'src/provider/static/static.provider';
import { ArticleProvider } from 'src/provider/article/article.provider';
import { DraftProvider } from 'src/provider/draft/draft.provider';
import { ISRProvider } from 'src/provider/isr/isr.provider';
import { config } from 'src/config';
import { checkTrue } from 'src/utils/checkTrue';
import { ApiToken } from 'src/provider/swagger/token';
import { sanitizePagination } from 'src/utils/pagination';

@ApiTags('img')
@UseGuards(...AdminGuard)
@ApiToken
@Controller('/api/admin/img')
export class ImgController {
  constructor(
    private readonly staticProvider: StaticProvider,
    private readonly articleProvider: ArticleProvider,
    private readonly draftProvider: DraftProvider,
    private readonly isrProvider: ISRProvider,
  ) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: any,
    @Query('favicon') favicon?: string,
    @Query('waterMarkText') waterMarkText?: string,
    @Query('withWaterMark') withWaterMark?: string,
  ) {
    let isFavicon = false;
    if (favicon && favicon == 'true') {
      isFavicon = true;
    }
    // 只有这里开启水印，并且设置里也开启水印，才能触发水印，双保险。避免后台某些表单上传图片也触发了水印。
    const updateConfig = {
      withWaterMark: checkTrue(withWaterMark),
      waterMarkText,
    };
    const res = await this.staticProvider.upload(file, 'img', isFavicon, undefined, updateConfig);
    return {
      statusCode: 200,
      data: res,
    };
  }

  @Get('all')
  async getAll() {
    const res = await this.staticProvider.getAll('img', 'public');
    return {
      statusCode: 200,
      data: res,
    };
  }

  @Post('scan')
  async scanImgsOfArticles() {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const res = await this.staticProvider.scanLinksOfArticles();
    return {
      statusCode: 200,
      data: res,
    };
  }
  @Post('rewrite-base-url')
  async rewriteBaseUrl(@Body() body: { oldBase?: string; newBase?: string }) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const articles = await this.articleProvider.rewriteBaseUrl(body?.oldBase, body?.newBase);
    const drafts = await this.draftProvider.rewriteBaseUrl(body?.oldBase, body?.newBase);
    if (articles.updated > 0) {
      this.isrProvider.activeAll('域名改写触发增量渲染！');
    }
    return {
      statusCode: 200,
      data: {
        articlesUpdated: articles.updated,
        draftsUpdated: drafts.updated,
        replacements: articles.replacements + drafts.replacements,
      },
    };
  }
  @Post('export')
  async exportAllImgs() {
    const res = await this.staticProvider.exportAllImg();
    return {
      statusCode: 200,
      data: res,
    };
  }
  @Delete('/all/delete')
  async deleteALL() {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const res = await this.staticProvider.deleteAllIMG();
    return {
      statusCode: 200,
      data: res,
    };
  }
  @Delete('/:sign')
  async delete(@Param('sign') sign: string) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const res = await this.staticProvider.deleteOneBySign(sign);
    return {
      statusCode: 200,
      data: res,
    };
  }
  @Get('')
  async getByOption(@Query('page') page: number, @Query('pageSize') pageSize = 5) {
    const paging = sanitizePagination(page, pageSize);
    const option: SearchStaticOption = {
      page: paging.page,
      pageSize: paging.pageSize,
      staticType: 'img',
      view: 'public',
    };
    const data = await this.staticProvider.getByOption(option);
    return {
      statusCode: 200,
      data,
    };
  }
}
