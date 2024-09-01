import { Injectable } from '@nestjs/common';
import { Article } from 'src/scheme/article.schema';
import { ArticleProvider } from '../article/article.provider';

@Injectable()
export class TagProvider {
  constructor(private readonly articleProvider: ArticleProvider) {}
  async getTagsWithArticle(includeHidden: boolean) {
    const allArticles = await this.articleProvider.getAll('list', includeHidden);
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
    return Object.keys(d).sort((a, b) => a.localeCompare(b));
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
  async updateTagByName(oldName: string, newName: string) {
    const articles: Article[] = await this.getArticlesByTag(oldName, true);
    for (const article of articles) {
      const newTags = [];
      if (article?.tags && article.tags.length > 0) {
        for (const t of article?.tags) {
          if (t != oldName) {
            newTags.push(t);
          } else {
            if (!article.tags.includes(newName)) {
              newTags.push(newName);
            }
          }
        }
      }
      await this.articleProvider.updateById(article.id, {
        tags: newTags,
      });
    }
    return { message: '更新成功！', total: articles.length };
  }
  async deleteOne(name: string) {
    const articles = await this.getArticlesByTag(name, true);
    for (const article of articles) {
      const newTags = [];
      if (article?.tags && article.tags.length > 0) {
        for (const t of article?.tags) {
          if (t != name) {
            newTags.push(t);
          }
        }
      }
      await this.articleProvider.updateById(article.id, {
        tags: newTags,
      });
    }
    return { message: '删除成功！', total: articles.length };
  }
}
