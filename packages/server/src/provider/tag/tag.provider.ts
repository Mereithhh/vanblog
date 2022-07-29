import { Injectable } from '@nestjs/common';
import { ArticleProvider } from '../article/article.provider';

@Injectable()
export class TagProvider {
  constructor(private readonly articleProvider: ArticleProvider) {}
  async getTagsWithArticle() {
    const allArticles = await this.articleProvider.getAll('list');
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

  async getAllTags() {
    const d = await this.getTagsWithArticle();
    return Object.keys(d);
  }

  async getArticlesByTag(tagName: string) {
    const d = await this.getTagsWithArticle();
    return d[tagName] ?? [];
  }
}
