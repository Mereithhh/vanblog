import { Injectable, Logger } from '@nestjs/common';
import { ChildProcess, spawn } from 'node:child_process';
import path from 'node:path';
@Injectable()
export class WebsiteProvider {
  // constructor() {}
  ctx: ChildProcess = null;
  logger = new Logger(WebsiteProvider.name);

  async init() {
    this.run();
  }
  async restart(reason: string) {
    this.logger.log(`${reason}重启 website`);
    if (this.ctx) {
      await this.stop();
    }
    await this.run();
  }
  async stop(noMessage?: boolean) {
    if (this.ctx) {
      this.ctx.unref();
      process.kill(-this.ctx.pid);
      this.ctx = null;
      if (noMessage) return;
      this.logger.log('website 停止成功！');
    }
  }
  async run(): Promise<any> {
    let cmd = 'dev';
    if (process.env.NODE_ENV == 'production') {
      cmd = 'start';
    }
    if (this.ctx == null) {
      this.ctx = spawn('yarn', [cmd], {
        env: {
          ...process.env,
        },
        cwd: path.join(path.resolve(process.cwd(), '..'), 'website'),
        detached: true,
      });
      this.ctx.on('message', (message) => {
        this.logger.log(message);
      });
      this.ctx.on('exit', async () => {
        this.ctx = null;
        this.logger.error('website 意外进程退出，自动重启');
        await this.stop(true);
        await this.run();
      });
      this.ctx.stdout.on('data', (data) => {
        const t: string = data.toString();
        this.logger.log(t.substring(0, t.length - 1));
      });
      this.ctx.stderr.on('data', (data) => {
        const t: string = data.toString();

        if (!t.includes('You have enabled experimental feature')) {
          this.logger.error(t.substring(0, t.length - 1));
        }
      });
    } else {
      this.logger.log('Website 启动成功！');
    }
  }
}
