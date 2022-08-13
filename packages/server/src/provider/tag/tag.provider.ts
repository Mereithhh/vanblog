import { Injectable } from '@nestjs/common';
import { ArticleProvider } from '../article/article.provider';

@Injectable()
export class TagProvider {
  constructor(private readonly articleProvider: ArticleProvider) {}
  async getTagsWithArticle(includeHidden: boolean) {
    const allArticles = await this.articleProvider.getAll(
      'list',
      includeHidden,
    );
    const data = {};
    allArticles.forEach((a) => {
      a.tags.forEach((t) => {
        if (!Object.keys(data).includes(t)) {
          data[t] = [a];
        } else {
          data[t].push(a);
        }
      });
    });
    return data;
  }
  //TODO tag 改为缓存模式
  async getAllTags(includeHidden: boolean) {
    const d = await this.getTagsWithArticle(includeHidden);
    return Object.keys(d);
  }

  async getColumnData(topNum: number, includeHidden: boolean) {
    const data = await this.getTagsWithArticle(includeHidden);
    const tags = Object.keys(data);
    if (!tags || tags.length <= 0) {
      return [];
    }
    const res = [];
    const sortedTags = tags.sort((a, b) => {
      return data[b].length - data[a].length;
    });
    let i = 0;
    for (const t of sortedTags) {
      if (i == topNum) {
        break;
      }
      res.push({
        type: t,
        value: data[t].length || 0,
      });
      i = i + 1;
    }

    return res;
  }
  async getArticlesByTag(tagName: string, includeHidden: boolean) {
    const d = await this.getTagsWithArticle(includeHidden);
    return d[tagName] ?? [];
  }
}
