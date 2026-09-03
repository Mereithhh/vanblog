import { Injectable, Logger } from '@nestjs/common';
import { ChildProcess, spawn } from 'node:child_process';
import { config } from 'src/config';
import { WalineSetting } from 'src/types/setting.dto';
import { makeSalt } from 'src/utils/crypto';
import { isForceLoginCommentEnabled } from 'src/utils/walineLogin';
import {
  buildWalineEnvFromOtherConfig,
  stringifyWalineEnvValue,
  toWalineProcessEnv,
} from 'src/utils/walineExtra';
import { buildWalineMongoEnv } from 'src/utils/walineMongo';
import { MetaProvider } from '../meta/meta.provider';
import { SettingProvider } from '../setting/setting.provider';
@Injectable()
export class WalineProvider {
  // constructor() {}
  ctx: ChildProcess = null;
  logger = new Logger(WalineProvider.name);
  env = {};
  constructor(
    private metaProvider: MetaProvider,
    private readonly settingProvider: SettingProvider,
  ) {}

  mapConfig2Env(config: WalineSetting): Record<string, any> {
    const walineEnvMapping = {
      'smtp.port': 'SMTP_PORT',
      'smtp.host': 'SMTP_HOST',
      'smtp.user': 'SMTP_USER',
      'sender.name': 'SENDER_NAME',
      'sender.email': 'SENDER_EMAIL',
      'smtp.password': 'SMTP_PASS',
      authorEmail: 'AUTHOR_EMAIL',
      webhook: 'WEBHOOK',
      forceLoginComment: 'LOGIN',
    };
    const result = {};
    if (!config) {
      return result;
    }
    for (const key of Object.keys(config)) {
      if (key == 'forceLoginComment') {
        continue;
      } else if (key == 'otherConfig') {
        Object.assign(result, buildWalineEnvFromOtherConfig(config.otherConfig));
      } else {
        const rKey = walineEnvMapping[key];
        if (rKey) {
          const asString = stringifyWalineEnvValue(config[key]);
          if (asString !== undefined) {
            result[rKey] = asString;
          }
        }
      }
    }
    // Apply last so Ant Design string "true" and otherConfig LOGIN cannot skip/override the toggle.
    if (isForceLoginCommentEnabled(config.forceLoginComment)) {
      result['LOGIN'] = 'force';
    }
    if (!config['smtp.enabled']) {
      const r2 = {};
      for (const [k, v] of Object.entries(result)) {
        if (
          ![
            'SMTP_PASS',
            'SMTP_USER',
            'SMTP_HOST',
            'SMTP_PORT',
            'SENDER_NAME',
            'SENDER_EMAIL',
          ].includes(k)
        ) {
          r2[k] = v;
        }
      }
      return toWalineProcessEnv(r2);
    }
    return toWalineProcessEnv(result);
  }
  async loadEnv() {
    const mongoEnv = buildWalineMongoEnv(config.mongoUrl, config.walineDB);
    const siteInfo = await this.metaProvider.getSiteInfo();
    const otherEnv = {
      SITE_NAME: siteInfo?.siteName || undefined,
      SITE_URL: siteInfo?.baseUrl || undefined,
      JWT_TOKEN: global.jwtSecret || makeSalt(),
    };
    const walineConfig = await this.settingProvider.getWalineSetting();
    const walineConfigEnv = this.mapConfig2Env(walineConfig);
    this.env = {
      ...mongoEnv,
      ...otherEnv,
      ...walineConfigEnv,
    };
    this.logger.log(`waline 配置： ${JSON.stringify(this.env, null, 2)}`);
  }
  async init() {
    this.run();
  }
  async restart(reason: string) {
    this.logger.log(`${reason}重启 waline`);
    if (this.ctx) {
      await this.stop();
    }
    await this.run();
  }
  async stop() {
    if (!this.ctx) {
      return;
    }
    const child = this.ctx;
    this.ctx = null;
    await new Promise<void>((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) {
          return;
        }
        settled = true;
        resolve();
      };
      child.once('exit', finish);
      const kill = (signal: NodeJS.Signals) => {
        try {
          process.kill(-child.pid, signal);
        } catch {
          try {
            child.kill(signal);
          } catch {
            finish();
          }
        }
      };
      kill('SIGTERM');
      setTimeout(() => {
        if (!settled) {
          kill('SIGKILL');
        }
        setTimeout(finish, 200);
      }, 2000);
    });
    this.logger.log('waline 停止成功！');
  }
  async run(): Promise<any> {
    await this.loadEnv();
    const base = '../waline/node_modules/@waline/vercel/vanilla.js';
    if (this.ctx == null) {
      this.ctx = spawn('node', [base], {
        env: {
          ...process.env,
          ...toWalineProcessEnv(this.env as Record<string, unknown>),
        },
        cwd: process.cwd(),
        detached: true,
      });
      this.ctx.on('message', (message) => {
        this.logger.log(message);
      });
      this.ctx.on('exit', () => {
        this.ctx = null;
        this.logger.warn('Waline 进程退出');
      });
      this.ctx.stdout.on('data', (data) => {
        const t = data.toString();
        if (!t.includes('Cannot find module')) {
          this.logger.log(t.substring(0, t.length - 1));
        }
      });
      this.ctx.stderr.on('data', (data) => {
        const t = data.toString();
        this.logger.error(t.substring(0, t.length - 1));
      });
    } else {
      await this.stop();
      await this.run();
    }
    this.logger.log('Waline 启动成功！');
  }
}
