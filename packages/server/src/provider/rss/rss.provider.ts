import { Injectable, Logger } from '@nestjs/common';

import { ArticleProvider } from '../article/article.provider';
import { Feed } from 'feed';
import { MetaProvider } from '../meta/meta.provider';
import { SettingProvider } from '../setting/setting.provider';
import fs from 'fs';
import path from 'path';
import { config } from 'src/config';
import { MarkdownProvider } from '../markdown/markdown.provider';
import { washUrl } from 'src/utils/washUrl';

@Injectable()
export class RssProvider {
  logger = new Logger(RssProvider.name);
  timer = null;
  constructor(
    private readonly articleProvider: ArticleProvider,
    private readonly metaProvider: MetaProvider,
    private readonly settingProvider: SettingProvider,
    private readonly markdownProvider: MarkdownProvider,
  ) {}

  async generateRssFeed(info?: string, delay?: number) {
    // 生成 RSS 订阅需要遍历全部文章数据，所以防抖时间长一点吧。
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(
      () => {
        this.generateRssFeedFn(info);
      },
      delay || 3 * 60 * 1000,
    );
  }

  async generateRssFeedFn(info?: string) {
    this.logger.log(info + '重新生成 RSS 订阅');
    try {
      let articles = await this.articleProvider.getAll('public', false, false);
      articles = articles.map((a: any) => {
        const article = a?._doc || a;
        if (article.private) {
          return { ...article, content: '此文章已加密' };
        } else {
          return article;
        }
      });
      const meta = await this.metaProvider.getAll();
      const walineSetting = await this.settingProvider.getWalineSetting();
      let email = process.env.EMAIL;
      if (walineSetting && walineSetting?.authorEmail) {
        email = walineSetting?.authorEmail;
      }
      walineSetting?.authorEmail;
      const author = {
        name: meta.siteInfo.author,
        email,
        link: meta.siteInfo.baseUrl,
      };
      const siteUrl = washUrl(meta.siteInfo.baseUrl);
      const favicon =
        meta.siteInfo.favicon ||
        meta.siteInfo.siteLogo ||
        meta.siteInfo.authorLogo ||
        `${siteUrl}logo.svg`;
      const siteLogo =
        meta.siteInfo.siteLogo ||
        meta.siteInfo.authorLogo ||
        meta.siteInfo.favicon ||
        `${siteUrl}logo.svg`;
      const date = new Date();
      const feed = new Feed({
        title: meta.siteInfo.siteName,
        description: meta.siteInfo.siteDesc,
        id: siteUrl,
        link: siteUrl,
        language: '	zh-cn',
        image: siteLogo,
        favicon: favicon,
        copyright: `All rights reserved ${date.getFullYear()}, ${meta.siteInfo.author}`,
        updated: date,
        generator: 'Feed for VanBlog',
        feedLinks: {
          rss2: `${siteUrl}rss/feed.xml`, // xml format
          json: `${siteUrl}rss/feed.json`, // json fromat
        },
        author,
      });
      for (const article of articles) {
        const url = `${siteUrl}post/${article.pathname || article.id}`;
        const category = {
          name: article.category,
          domain: `${siteUrl}/category/${article.category}`,
        };
        const html = `<div class="markdown-body rss">
      <link rel="stylesheet" href="${siteUrl}markdown.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.6.0/build/styles/default.min.css">
      ${this.markdownProvider
        .renderMarkdown(article.content)
        .replace(
          /<div class="mermaid">/g,
          `<div class="mermaid" style="background: #f3f3f3; padding: 8px;"> <p>Mermaid 图表 RSS 暂无法显示，具体请查看原文</p>`,
        )}</div>`;
        feed.addItem({
          title: article.title,
          id: url,
          link: url,
          description: this.markdownProvider.renderMarkdown(
            this.markdownProvider.getDescription(article.content),
          ),
          category: [category],
          content: html,
          author: [author],
          contributor: [author],
          date: new Date(article.createdAt),
          published: new Date(article.updatedAt || article.createdAt),
        });
      }
      const rssPath = path.join(config.staticPath, 'rss');

      fs.mkdirSync(rssPath, { recursive: true });
      fs.writeFileSync(path.join(rssPath, 'feed.json'), feed.json1());
      fs.writeFileSync(path.join(rssPath, 'feed.xml'), feed.rss2());
      fs.writeFileSync(path.join(rssPath, 'atom.xml'), feed.atom1());
    } catch (err) {
      this.logger.error('生成订阅源失败！');
      this.logger.error(JSON.stringify(err, null, 2));
    }
  }
}
