import { Injectable, Logger } from '@nestjs/common';
import { ChildProcess, spawn } from 'node:child_process';
import path from 'node:path';
import { MetaProvider } from '../meta/meta.provider';

const ignoreWebsiteWarnings = [
  'Experimental features are not covered by semver',
  'You have enabled experimental feature',
  'Invalid next.config.js options',
  'The value at .experimental has an',
  '(node:62) ExperimentalWarning',
  'null',
];

@Injectable()
export class WebsiteProvider {
  // constructor() {}
  ctx: ChildProcess = null;
  logger = new Logger(WebsiteProvider.name);
  constructor(private metaProvider: MetaProvider) {}
  async init() {
    this.run();
  }
  async loadEnv() {
    const meta = await this.metaProvider.getAll();
    if (!meta?.siteInfo) return {};
    const siteinfo = meta.siteInfo;
    const socials = meta.socials;
    const urls = [];
    const addEach = (u: string) => {
      if (!u) return null;
      try {
        const url = new URL(u);
        if (url?.hostname) {
          if (!urls.includes(url?.hostname)) {
            urls.push(url?.hostname);
          }
        }
      } catch (err) {
        return null;
      }
    };
    addEach(siteinfo?.baseUrl);
    addEach(siteinfo?.siteLogo);
    addEach(siteinfo?.authorLogo);
    addEach(siteinfo?.authorLogoDark);
    addEach(siteinfo?.payAliPay);
    addEach(siteinfo?.payAliPayDark);
    addEach(siteinfo?.payWechat);
    addEach(siteinfo?.payWechatDark);
    const wechatItem = socials.find((s) => s.type == 'wechat');
    if (wechatItem) {
      addEach(wechatItem?.value);
    }
    const wechatDarkItem = socials.find((s) => s.type == 'wechat-dark');
    if (wechatDarkItem) {
      addEach(wechatDarkItem?.value);
    }
    return { VAN_BLOG_ALLOW_DOMAINS: urls.join(',') };
  }
  async restart(reason: string) {
    this.logger.log(`${reason}重启 website`);
    if (this.ctx) {
      await this.stop();
    }
  }
  async restore(reason: string) {
    this.logger.log(`${reason}`);
    if (this.ctx) this.ctx = null;
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
    const loadEnvs = await this.loadEnv();
    this.logger.log(JSON.stringify(loadEnvs, null, 2));
    if (this.ctx == null) {
      this.ctx = spawn('yarn', [cmd], {
        env: {
          ...process.env,
          ...loadEnvs,
        },
        cwd: path.join(path.resolve(process.cwd(), '..'), 'website'),
        detached: true,
        shell: process.platform === 'win32',
      });
      this.ctx.on('message', (message) => {
        this.logger.log(message);
      });
      this.ctx.on('exit', async () => {
        await this.restore('website 进程退出，自动重启');
      });
      this.ctx.stdout.on('data', (data) => {
        const t: string = data.toString();
        this.logger.log(t.substring(0, t.length - 1));
      });
      this.ctx.stderr.on('data', (data) => {
        const t: string = data.toString();

        let showLog = true;
        for (const each of ignoreWebsiteWarnings) {
          if (t.includes(each)) showLog = false;
        }
        if (showLog) {
          this.logger.error(t.substring(0, t.length - 1));
        }
      });
    } else {
      this.logger.log('Website 启动成功！');
    }
  }
}
