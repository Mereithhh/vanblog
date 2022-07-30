import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ArticleProvider } from 'src/provider/article/article.provider';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { CategoryProvider } from 'src/provider/category/category.provider';
import { DraftProvider } from 'src/provider/draft/draft.provider';
import { MetaProvider } from 'src/provider/meta/meta.provider';
import { TagProvider } from 'src/provider/tag/tag.provider';
import { UserProvider } from 'src/provider/user/user.provider';
import * as fs from 'fs';
import * as dayjs from 'dayjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { removeID } from 'src/utils/removeId';
import { ViewerProvider } from 'src/provider/viewer/viewer.provider';
import { VisitProvider } from 'src/provider/visit/visit.provider';

@ApiTags('backup')
@UseGuards(AdminGuard)
@Controller('/api/admin/backup')
export class BackupController {
  private readonly logger = new Logger(BackupController.name);
  constructor(
    private readonly articleProvider: ArticleProvider,
    private readonly categoryProvider: CategoryProvider,
    private readonly tagProvider: TagProvider,
    private readonly metaProvider: MetaProvider,
    private readonly draftProvider: DraftProvider,
    private readonly userProvider: UserProvider,
    private readonly viewerProvider: ViewerProvider,
    private readonly visitProvider: VisitProvider,
  ) {}

  @Get('export')
  async getAll(@Res() res: Response) {
    const articles = await this.articleProvider.getAll('admin');
    const categories = await this.categoryProvider.getAllCategories();
    const tags = await this.tagProvider.getAllTags();
    const meta = await this.metaProvider.getAll();
    const drafts = await this.draftProvider.getAll();
    const user = await this.userProvider.getUser();
    // 访客记录
    const viewer = await this.viewerProvider.getAll();
    const visit = await this.visitProvider.getAll();
    const data = {
      articles,
      tags,
      meta,
      drafts,
      categories,
      user,
      viewer,
      visit,
    };
    // 拼接一个临时文件
    const name = `temp.json`;
    fs.writeFileSync(name, JSON.stringify(data, null, 2));
    res.download(name, (err) => {
      if (!err) {
        this.logger.log('success', 'download');
        return;
      }
      this.logger.error(err.stack);
      fs.rmSync(name);
    });
  }

  @Post('/import')
  @UseInterceptors(FileInterceptor('file'))
  async importAll(@UploadedFile() file: Express.Multer.File) {
    const json = file.buffer.toString();
    const data = JSON.parse(json);
    // eslint-disable-next-line prefer-const
    let { articles, meta, drafts, user } = data;
    // 去掉 id
    articles = removeID(articles);
    drafts = removeID(drafts);
    delete user._id;
    delete user.__v;
    delete meta._id;

    await this.articleProvider.importArticles(articles);
    await this.draftProvider.importDrafts(drafts);
    await this.userProvider.updateUser(user);
    await this.metaProvider.update(meta);
    return {
      statusCode: 200,
      data: '导入成功！',
    };
  }
}
