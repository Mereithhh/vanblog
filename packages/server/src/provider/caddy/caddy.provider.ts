import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import { SettingProvider } from '../setting/setting.provider';

export const CADDY_LISTENER_WRAPPERS_URL =
  'http://127.0.0.1:2019/config/apps/http/servers/srv1/listener_wrappers';

export const HTTP_REDIRECT_WRAPPERS = [{ wrapper: 'http_redirect' }];

@Injectable()
export class CaddyProvider {
  subjects: string[] = [];
  logger = new Logger(CaddyProvider.name);
  constructor(private readonly settingProvider: SettingProvider) {
    this.init();
  }
  async init() {
    // this.subjects = await getDefaultSubjects();
    // this.logger.log(`默认 subjects:`, this.subjects);
    // await this.updateSubjects(this.subjects);
    const configInDB = await this.settingProvider.getHttpsSetting();
    let txt = '初始化 caddy 配置完成！';
    if (configInDB?.redirect) {
      await this.setRedirect(true);
      txt = txt + 'https 自动重定向已开启';
    } else {
      await this.setRedirect(false);
      txt = 'https 自动重定向已关闭';
    }

    this.logger.log(txt);
  }
  clearLog() {
    try {
      fs.writeFileSync('/var/log/caddy.log', '');
    } catch (err) {}
  }
  async addSubject(domain: string) {
    if (!this.subjects.includes(domain)) {
      this.subjects.push(domain);
      await this.updateSubjects(this.subjects);
    }
  }

  async setRedirect(redirect: boolean) {
    if (!redirect) {
      try {
        await axios.delete(CADDY_LISTENER_WRAPPERS_URL);
      } catch (err) {
        if (!this.isNotFound(err)) {
          this.logger.error('关闭 https 自动重定向失败');
          return false;
        }
      }
      try {
        if (await this.hasHttpRedirectWrapper()) {
          this.logger.error('关闭 https 自动重定向失败');
          return false;
        }
      } catch (err) {
        this.logger.error('关闭 https 自动重定向失败');
        return false;
      }
      this.logger.log('https 自动重定向已关闭');
      return '关闭成功！';
    }

    try {
      await this.replaceListenerWrappers(HTTP_REDIRECT_WRAPPERS);
      if (!(await this.hasHttpRedirectWrapper())) {
        this.logger.error('开启 https 自动重定向失败');
        return false;
      }
      this.logger.log('https 自动重定向已开启');
      return '开启成功！';
    } catch (err) {
      this.logger.error('开启 https 自动重定向失败');
      return false;
    }
  }

  async getSubjects() {
    try {
      const res = await axios.get(
        'http://127.0.0.1:2019/config/apps/tls/automation/policies/subjects',
      );
      return res?.data;
    } catch (err) {
      // console.log(err);
      this.logger.error('更新 subjects 失败，通过 IP 进行 https 访问可能受限');
    }
  }
  async getAutomaticDomains() {
    try {
      const res = await axios.get('http://127.0.0.1:2019/config/apps/tls/certificates/automate');
      return res?.data;
    } catch (err) {
      console.log(err);
    }
  }

  async updateSubjects(domains: string[]) {
    try {
      const res = await axios.patch(
        'http://127.0.0.1:2019/config/apps/tls/automation/policies/0/subjects',
        domains,
      );
      if (res.status == 200) {
        return true;
      }
    } catch (err) {
      console.log(err?.data?.error || err);
    }
    return false;
  }
  async applyHttpsChange(domains: string[]) {
    return await this.updateHttpsDomains([...domains, ...this.subjects]);
  }

  async updateHttpsDomains(domains: string[]) {
    try {
      const res = await axios.patch(
        'http://127.0.0.1:2019/config/apps/tls/certificates/automate',
        domains,
      );
      if (res.status == 200) {
        return true;
      }
    } catch (err) {
      console.log(err);
    }
    return false;
  }
  async getConfig() {
    try {
      const res = await axios.get('http://127.0.0.1:2019/config');
      return res?.data;
    } catch (err) {
      console.log(err);
    }
  }
  async getLog() {
    try {
      const data = fs.readFileSync('/var/log/caddy.log', { encoding: 'utf-8' });
      return data.toString();
    } catch (err) {
      return '';
    }
  }

  /**
   * Caddy 2019 API: POST appends to an existing array (and would nest a whole
   * array payload as one element). PATCH replaces the field when it exists;
   * PUT creates it when missing. Enable must replace, not append.
   */
  private async replaceListenerWrappers(wrappers: Array<{ wrapper: string }>) {
    try {
      await axios.patch(CADDY_LISTENER_WRAPPERS_URL, wrappers);
    } catch (err) {
      if (!this.isNotFound(err)) {
        throw err;
      }
      await axios.put(CADDY_LISTENER_WRAPPERS_URL, wrappers);
    }
  }

  private async hasHttpRedirectWrapper(): Promise<boolean> {
    try {
      const res = await axios.get(CADDY_LISTENER_WRAPPERS_URL);
      return this.wrappersIncludeHttpRedirect(res?.data);
    } catch (err) {
      if (this.isNotFound(err)) {
        return false;
      }
      throw err;
    }
  }

  private wrappersIncludeHttpRedirect(wrappers: unknown): boolean {
    if (!Array.isArray(wrappers)) {
      return false;
    }
    return wrappers.some((item) => {
      if (item === 'http_redirect') {
        return true;
      }
      return Boolean(
        item &&
          typeof item === 'object' &&
          (item as { wrapper?: string }).wrapper === 'http_redirect',
      );
    });
  }

  private isNotFound(err: unknown): boolean {
    return (
      Boolean(err) &&
      typeof err === 'object' &&
      (err as { response?: { status?: number } }).response?.status === 404
    );
  }
}
