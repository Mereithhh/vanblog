import { Injectable, Logger } from '@nestjs/common';
import { ArticleProvider } from '../article/article.provider';
import { encodeQuerystring, washUrl } from 'src/utils/washUrl';
import { CustomPageProvider } from '../customPage/customPage.provider';
import { CategoryProvider } from '../category/category.provider';
import { TagProvider } from '../tag/tag.provider';
import { MetaProvider } from '../meta/meta.provider';
import { SitemapStream, streamToPromise } from 'sitemap';
import { config } from 'src/config';
import path from 'path';
import fs from 'fs';

@Injectable()
export class SiteMapProvider {
  logger = new Logger(SiteMapProvider.name);
  timer = null;
  constructor(
    private readonly articleProvider: ArticleProvider,
    private readonly categoryProvider: CategoryProvider,
    private readonly tagProvider: TagProvider,
    private readonly customPageProvider: CustomPageProvider,
    private readonly metaProvider: MetaProvider,
  ) {}

  async generateSiteMap(info?: string, delay?: number) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(
      () => {
        this.generateSiteMapFn(info);
      },
      delay || 60 * 1000,
    );
  }

  async generateSiteMapFn(info?: string) {
    this.logger.log(info + '重新生成 SiteMap ');
    const pathnames = await this.getSiteUrls();
    const siteInfo = await this.metaProvider.getSiteInfo();
    const baseUrl = siteInfo?.baseUrl || '';
    const smStream = new SitemapStream({ hostname: washUrl(baseUrl) });
    pathnames.forEach((pathname) => {
      smStream.write({
        url: pathname,
      });
    });
    streamToPromise(smStream).then((sm) => {
      const sitemapPath = path.join(config.staticPath, 'sitemap');

      fs.mkdirSync(sitemapPath, { recursive: true });
      fs.writeFileSync(path.join(sitemapPath, 'sitemap.xml'), sm);
    });
    smStream.end();
  }
  async getArticleUrls() {
    const articles = await this.articleProvider.getAll('list', false, false);
    return articles.map((a) => {
      return `/post/${a.pathname || a.id}`;
    });
  }
  async getCategoryUrls() {
    const categories = await this.categoryProvider.getAllCategories();
    return categories.map((c) => {
      return `/category/${encodeQuerystring(c)}`;
    });
  }
  async getPageUrls() {
    const num = await this.articleProvider.getTotalNum(false);
    const total = Math.ceil(num / 5);
    const paths = [];
    for (let i = 1; i <= total; i++) {
      paths.push(`/page/${i}`);
    }
    return paths;
  }
  async getCustomUrls() {
    const data = await this.customPageProvider.getAll();
    return data.map((c) => {
      return `/c${c.path}`;
    });
  }
  async getTagUrls() {
    const tags = await this.tagProvider.getAllTags(false);
    return tags.map((c) => {
      return `/tag/${encodeQuerystring(c)}`;
    });
  }
  async getSiteUrls() {
    let urlList = ['/', '/category', '/tag', '/timeline', '/about', '/link'];
    urlList = urlList.concat(await this.getArticleUrls());
    urlList = urlList.concat(await this.getTagUrls());
    urlList = urlList.concat(await this.getCategoryUrls());
    urlList = urlList.concat(await this.getPageUrls());
    urlList = urlList.concat(await this.getCustomUrls());
    return urlList;
  }
}
