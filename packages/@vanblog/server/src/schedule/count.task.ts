import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import { MetaProvider } from 'src/provider/meta/meta.provider';
@Injectable()
export class CountTask {
  private readonly logger = new Logger(CountTask.name);
  constructor(private readonly metaProvider: MetaProvider) {}

  @Interval(1000 * 60 * 5)
  async handleCron() {
    await this.metaProvider.updateTotalWords('定时任务');
  }
}
