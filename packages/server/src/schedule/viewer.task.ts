import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import dayjs from 'dayjs';
import { MetaProvider } from 'src/provider/meta/meta.provider';
import { ViewerProvider } from 'src/provider/viewer/viewer.provider';
@Injectable()
export class ViewerTask {
  private readonly logger = new Logger(ViewerTask.name);
  constructor(
    private readonly metaProvider: MetaProvider,
    private readonly viewerProvider: ViewerProvider,
  ) {}

  @Cron('0 0 * * *')
  async handleCron() {
    const curTime = dayjs();
    const { visited, viewer } = await this.metaProvider.getViewer();
    this.logger.debug(
      `[${curTime.format('YYYY-MM-DD HH:mm:ss')}] visitor: ${visited} \t viewer: ${viewer}`,
    );
    this.viewerProvider.createOrUpdate({
      viewer: viewer,
      visited: visited,
      date: curTime.format('YYYY-MM-DD'),
    });
  }
}
