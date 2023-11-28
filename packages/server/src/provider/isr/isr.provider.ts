import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Article } from 'src/scheme/article.schema';
import { sleep } from 'src/utils/sleep';
import { ArticleProvider } from '../article/article.provider';
import { RssProvider } from '../rss/rss.provider';
import { SettingProvider } from '../setting/setting.provider';
import { SiteMapProvider } from '../sitemap/sitemap.provider';
export interface ActiveConfig {
  postId?: number;
  forceActice?: boolean;
}
@Injectable()
export class ISRProvider {
  urlList = ['/', '/category', '/tag', '/timeline', '/about', '/link'];
  base = 'http://127.0.0.1:3001/api/revalidate?path=';
  logger = new Logger(ISRProvider.name);
  timer = null;
  constructor(
    private readonly articleProvider: ArticleProvider,
    private readonly rssProvider: RssProvider,
    private readonly sitemapProvider: SiteMapProvider,
    private readonly settingProvider: SettingProvider,
  ) {}
  async activeAllFn(info?: string, activeConfig?: ActiveConfig) {
    const isrConfig = await this.settingProvider.getISRSetting();
    if (isrConfig?.mode == 'delay' && !activeConfig?.forceActice) {
      this.logger.debug(`延时自动更新模式，阻止按需 ISR`);
      return;
    }
    if (info) {
      this.logger.log(info);
    } else {
      this.logger.log('首次启动触发全量渲染！');
    }
    // ! 配置差的机器可能并发多了会卡，所以改成串行的。

    await this.activeUrls(this.urlList, false);
    let postId: any = null;
    const articleWithThisId = await this.articleProvider.getById(postId, 'list');
    if (articleWithThisId) {
      postId = articleWithThisId.pathname || articleWithThisId.id;
    }
    await this.activePath('post', postId || undefined);
    await this.activePath('page');
    await this.activePath('category');
    await this.activePath('tag');
    this.logger.log('触发全量渲染完成！');
  }
  async activeAll(info?: string, delay?: number, activeConfig?: ActiveConfig) {
    if (process.env['VANBLOG_DISABLE_WEBSITE'] === 'true') {
      return;
    }
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.rssProvider.generateRssFeed(info || '', delay);
      this.sitemapProvider.generateSiteMap(info || '', delay);
      this.activeWithRetry(() => {
        this.activeAllFn(info, activeConfig);
      });
    }, 1000);
  }

  async testConn() {
    try {
      await axios.get(encodeURI(this.base + '/'));
      return true;
    } catch {
      return false;
    }
  }
  async activeWithRetry(fn: any, info?: string) {
    const max = 6;
    const delay = 3000;
    let succ = false;
    for (let t = 0; t < max; t++) {
      const r = await this.testConn();
      if (t > 0) {
        this.logger.warn(`第${t}次重试触发增量渲染！来源：${info || '首次启动触发全量渲染！'}`);
      }
      if (r) {
        fn(info);
        succ = true;
        break;
      } else {
        // 延迟
        await sleep(delay);
      }
    }
    if (!succ) {
      this.logger.error(`达到最大增量渲染重试次数！来源：${info || '首次启动触发全量渲染！'}`);
    }
  }
  async activeUrls(urls: string[], log: boolean) {
    for (const each of urls) {
      await this.activeUrl(each, log);
    }
  }
  async activePath(type: 'category' | 'tag' | 'page' | 'post', postId?: number) {
    switch (type) {
      case 'category':
        const categoryUrls = await this.sitemapProvider.getCategoryUrls();
        await this.activeUrls(categoryUrls, false);
        break;
      case 'page':
        const pageUrls = await this.sitemapProvider.getPageUrls();
        await this.activeUrls(pageUrls, false);
        break;
      case 'tag':
        const tagUrls = await this.sitemapProvider.getTagUrls();
        await this.activeUrls(tagUrls, false);
        break;
      case 'post':
        const articleUrls = await this.getArticleUrls();
        if (postId) {
          const urlsWithoutThisId = articleUrls.filter((u) => u !== `/post/${postId}`);
          await this.activeUrls([`/post/${postId}`, ...urlsWithoutThisId], false);
        } else {
          await this.activeUrls(articleUrls, false);
        }
        break;
    }
  }

  // 修改文章牵扯太多，暂时不用这个方法。
  async activeArticleById(id: number, event: 'create' | 'delete' | 'update', beforeObj?: Article) {
    const { article, pre, next } = await this.articleProvider.getByIdOrPathnameWithPreNext(
      id,
      'list',
    );
    // 无论是什么事件都先触发文章本身、标签和分类。
    this.activeUrl(`/post/${id}`, true);
    if (pre) {
      this.activeUrl(`/post/${pre?.id}`, true);
    }
    if (next) {
      this.activeUrl(`/post/${next?.id}`, true);
    }
    const tags = article.tags;
    if (tags && tags.length > 0) {
      for (const each of tags) {
        this.activeUrl(`/tag/${each}`, true);
      }
    }
    const category = article.category;
    this.activeUrl(`/category/${category}`, true);

    if (event == 'update' && beforeObj) {
      // 更新文档需要考虑更新之前的标签和分类。
      const tags = beforeObj.tags;
      if (tags && tags.length > 0) {
        for (const each of tags) {
          this.activeUrl(`/tag/${each}`, true);
        }
      }
      const category = beforeObj.category;
      this.activeUrl(`/category/${category}`, true);
    }

    // 时间线、首页、标签页、tag 页

    this.activeUrl(`/timeline`, true);
    this.activeUrl(`/tag`, true);
    this.activeUrl(`/category`, true);
    this.activeUrl(`/`, true);
    // 如果是创建或者删除需要重新触发 page 页面
    // 如果更改了 hidden 或者 private 也需要触发全部 page 页面
    // 干脆就都触发了。
    // if (event == 'create' || event == 'delete') {
    this.logger.log('触发全部 page 页增量渲染！');
    this.activePath('page');
    // }
  }

  async activeAbout(info: string) {
    this.activeWithRetry(() => {
      this.logger.log(info);
      this.activeUrl(`/about`, false);
    }, info);
  }
  async activeLink(info: string) {
    this.activeWithRetry(() => {
      this.logger.log(info);
      this.activeUrl(`/link`, false);
    }, info);
  }

  async activeUrl(url: string, log: boolean) {
    try {
      await axios.get(encodeURI(this.base + url));
      if (log) {
        this.logger.log(`触发增量渲染成功！ ${url}`);
      }
    } catch (err) {
      // console.log(err);
      this.logger.error(`触发增量渲染失败！ ${url}`);
    }
  }

  async getArticleUrls() {
    const articles = await this.articleProvider.getAll('list', true, true);
    return articles.map((a) => {
      return `/post/${a.pathname || a.id}`;
    });
  }
}
