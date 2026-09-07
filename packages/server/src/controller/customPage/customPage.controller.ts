import { Controller, Get, HttpException, Param, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { CustomPageProvider } from 'src/provider/customPage/customPage.provider';
import { resolvePublicCustomPageRequest } from 'src/utils/customPagePath';

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
      const target = resolvePublicCustomPageRequest(req.url);
      if (target.kind === 'redirect') {
        res.redirect(302, target.location);
        return;
      }
      if (target.kind === 'missing') {
        res.status(404);
        throw new HttpException('未找到该页面！', 404);
      }
      res.sendFile(target.absPath);
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
