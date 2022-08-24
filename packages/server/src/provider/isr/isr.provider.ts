import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Article } from 'src/scheme/article.schema';
import { ArticleProvider } from '../article/article.provider';
import { CategoryProvider } from '../category/category.provider';
import { TagProvider } from '../tag/tag.provider';
@Injectable()
export class ISRProvider {
  urlList = ['/', '/category', '/tag', '/timeline', '/about', '/link'];
  base = 'http://127.0.0.1:3001/api/revalidate?path=';
  logger = new Logger(ISRProvider.name);
  constructor(
    private readonly articleProvider: ArticleProvider,
    private readonly categoryProvider: CategoryProvider,
    private readonly tagProvider: TagProvider,
  ) {}
  async activeAll(info?: string) {
    if (info) {
      this.logger.log(info);
    } else {
      this.logger.log('首次启动触发全量渲染！');
    }
    Promise.all([
      this.activeUrls(this.urlList, false),
      this.activePath('category'),
      this.activePath('tag'),
      this.activePath('page'),
      this.activePath('post'),
    ]).then(() => {
      if (!info) {
        this.logger.log('触发全量渲染完成！');
      }
    });
  }

  async activeUrls(urls: string[], log: boolean) {
    for (const each of urls) {
      this.activeUrl(each, log);
    }
  }
  async activePath(type: 'category' | 'tag' | 'page' | 'post') {
    switch (type) {
      case 'category':
        const categoryUrls = await this.getCategoryUrls();
        await this.activeUrls(categoryUrls, false);
        break;
      case 'page':
        const pageUrls = await this.getPageUrls();
        await this.activeUrls(pageUrls, false);
        break;
      case 'tag':
        const tagUrls = await this.getTagUrls();
        await this.activeUrls(tagUrls, false);
        break;
      case 'post':
        const articleUrls = await this.getArticleUrls();
        await this.activeUrls(articleUrls, false);
        break;
    }
  }

  // 修改文章牵扯太多，暂时不用这个方法。
  async activeArticleById(
    id: number,
    event: 'create' | 'delete' | 'update',
    beforeObj?: Article,
  ) {
    const { article, pre, next } =
      await this.articleProvider.getByIdWithPreNext(id, 'list');
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
    this.logger.log(info);
    this.activeUrl(`/about`, false);
  }
  async activeLink(info: string) {
    this.logger.log(info);
    this.activeUrl(`/link`, false);
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

  async getPageUrls() {
    const num = await this.articleProvider.getTotalNum(false);
    const total = Math.ceil(num / 5);
    const paths = [];
    for (let i = 1; i <= total; i++) {
      paths.push(`/page/${i}`);
    }
    return paths;
  }
  async getCategoryUrls() {
    const categories = await this.categoryProvider.getAllCategories();
    return categories.map((c) => {
      return `/category/${c}`;
    });
  }
  async getTagUrls() {
    const tags = await this.tagProvider.getAllTags(false);
    return tags.map((c) => {
      return `/tag/${c}`;
    });
  }
  async getArticleUrls() {
    const { articles } = await this.articleProvider.getByOption(
      {
        regMatch: false,
        page: 1,
        pageSize: -1,
        toListView: true,
        withWordCount: false,
      },
      true,
    );
    return articles.map((a) => {
      return `/post/${a.id}`;
    });
  }
}
