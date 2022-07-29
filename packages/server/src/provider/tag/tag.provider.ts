import { Injectable } from '@nestjs/common';
import { ArticleProvider } from '../article/article.provider';

@Injectable()
export class TagProvider {
  constructor(private readonly articleProvider: ArticleProvider) {}
  async getTagsWirhArticle() {
    const allArticles = await this.articleProvider.getAll('admin');
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
    const d = await this.getTagsWirhArticle();
    return Object.keys(d);
  }

  async getArticlesByTag(tagName: string) {
    const d = await this.getTagsWirhArticle();
    return d[tagName] ?? [];
  }
}
