import { Controller, Get, HttpException, Param, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { CustomPageProvider } from 'src/provider/customPage/customPage.provider';
import { join } from 'path';
import { config } from 'src/config';
import { checkFolder } from 'src/utils/checkFolder';

@ApiTags('c')
@Controller('c')
export class PublicCustomPageController {
  constructor(private readonly customPageProvider: CustomPageProvider) {}
  @Get('/:pathname*')
  async getPageContent(
    @Param('pathname') pathname: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const foldername = pathname;
    if (!foldername) {
      res.status(404);
      throw new HttpException('未找到该页面！', 404);
    }
    const cur = await this.customPageProvider.getCustomPageByPath(`/${foldername}`);
    if (!cur) {
      res.status(404);
      throw new HttpException('未找到该页面！', 404);
    }
    if (cur.type == 'file' && !cur.html) {
      res.status(404);
      throw new HttpException('未找到该页面！', 404);
    } else if (cur.type == 'file' && cur.html) {
      res.status(200);
      res.send(cur.html);
      return;
    } else if (cur.type == 'folder') {
      let rPath = req.url.replace('/c/', '');
      const rPathArr = rPath.split('/');
      const lastString = rPathArr[rPathArr.length - 1];
      if (lastString == '') {
        // 尝试读取 index.html
        rPath = rPathArr.join('/') + `/index.html`;
      }
      if (!lastString.includes('.')) {
        // 两种情况： 无拓展名的文件/目录名
        if (checkFolder(join(config.staticPath, 'customPage', rPath))) {
          // 目录的话跳转。
          res.redirect(302, req.url + '/');
          return;
        }
      }
      const absPath = join(config.staticPath, 'customPage', rPath);
      res.sendFile(absPath);
      return;
    }
    res.status(404);
    throw new HttpException('未找到该页面！', 404);
  }
}

@Controller('custom')
export class PublicOldCustomPageRedirectController {
  @Get('/:pathname*')
  async redirect(@Res() res: Response, @Req() req: Request) {
    const newUrl = req.url.replace('/custom/', '/c/');
    res.redirect(301, newUrl);
    return;
  }
}
