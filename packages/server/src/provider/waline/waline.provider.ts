import { Injectable, Logger } from '@nestjs/common';
import { ChildProcess, spawn } from 'node:child_process';
import { config } from 'src/config';
import { MetaProvider } from '../meta/meta.provider';
@Injectable()
export class WalineProvider {
  // constructor() {}
  ctx: ChildProcess = null;
  logger = new Logger(WalineProvider.name);
  env = {};
  constructor(private metaProvider: MetaProvider) {}
  async loadEnv() {
    const url = new URL(config.mongoUrl);
    const mongoEnv = {
      MONGO_HOST: url.hostname,
      MONGO_PORT: url.port,
      MONGO_USER: url.username,
      MONGO_PASSWORD: url.password,
      MONGO_DB: config.walineDB,
      MONGO_AUTHSOURCE: 'admin',
    };
    const siteInfo = await this.metaProvider.getSiteInfo();
    const otherEnv = {
      SITE_NAME: siteInfo?.siteName || undefined,
      SITE_URL: siteInfo?.baseUrl || undefined,
    };
    this.env = { ...mongoEnv, ...otherEnv };
  }
  async init() {
    const siteInfo = await this.metaProvider.getSiteInfo();
    const enable = siteInfo?.enableComment != 'false';
    this.logger.log(`评论服务已${enable ? '开启' : '关闭'}`);
    if (enable) {
      this.run();
    }
  }
  async stop() {
    if (this.ctx) {
      this.ctx.kill();
      this.logger.log('waline 停止成功！');
    }
  }
  async run(): Promise<any> {
    await this.loadEnv();
    const base = 'node_modules/@waline/vercel/vanilla.js';
    if (this.ctx == null) {
      this.ctx = spawn('node', [base], {
        env: {
          ...process.env,
          ...this.env,
        },
        cwd: process.cwd(),
      });
      this.ctx.on('message', (message) => {
        this.logger.log(message);
      });
      this.ctx.on('exit', () => {
        this.ctx = null;
        this.logger.warn('Waline 进程退出');
      });
      this.ctx.on('error', (err) => {
        this.logger.error('Waline 错误' + err);
      });
      this.ctx.on('close', () => {
        this.logger.warn('Waline 进程退出');
        this.ctx = null;
      });
      this.ctx.stdout.on('data', (data) => {
        const t = data.toString();
        if (
          !t.includes("Cannot find module '/app/server/node_modules/sqlite3")
        ) {
          this.logger.log(data.toString());
        }
      });
      this.ctx.stderr.on('data', (data) => {
        this.logger.error(data.toString());
      });
    } else {
      this.logger.log('Waline 启动成功！');
    }
  }
}
