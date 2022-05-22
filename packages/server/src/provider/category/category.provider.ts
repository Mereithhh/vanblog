import { Injectable, NotFoundException } from '@nestjs/common';
import { AritcleProvider } from '../article/article.provider';
import { MetaProvider } from '../meta/meta.provider';

@Injectable()
export class CategoryProvider {
  constructor(
    private readonly articleProvider: AritcleProvider,
    private readonly metaProvider: MetaProvider,
  ) {}
  async getCategoriesWirhArticle() {
    const allArticles = await this.articleProvider.findAll();
    const categories = await this.getAllCategories();
    const data = {};
    categories.forEach((c) => {
      data[c] = [];
    });
    allArticles.forEach((a) => {
      data[a.category].push(a);
    });
    return data;
  }

  async getAllCategories() {
    const d = await this.metaProvider.getAll();
    if (!d) {
      throw new NotFoundException();
    }
    return d.categories;
  }

  async getArticlesByCategory(name: string) {
    const d = await this.getCategoriesWirhArticle();
    return d[name] ?? [];
  }

  async addOne(name: string) {
    const allMeta = await this.metaProvider.getAll();
    const newCategories = allMeta.categories;
    if (!allMeta.categories.includes(name)) {
      newCategories.push(name);
    }
    this.metaProvider.update({ categories: newCategories });
  }

  async deleteOne(name: string) {
    // 先检查一下有没有这个分类的文章
    const d = await this.getArticlesByCategory(name);
    if (d && d.length) {
      throw Error('分类已有文章，无法删除！');
    }

    const allMeta = await this.metaProvider.getAll();
    const newCategories = [];
    allMeta.categories.forEach((c) => {
      if (c !== name) {
        newCategories.push(c);
      }
    });
    this.metaProvider.update({ categories: newCategories });
  }

  async updateCategoryByName(name: string, newName: string) {
    const allMeta = await this.metaProvider.getAll();
    // 先修改文章分类
    const articles = await this.getArticlesByCategory(name);
    if (articles && articles.length) {
      for (const article of articles) {
        await this.articleProvider.updateById(article.id, {
          category: newName,
        });
      }
    }
    // 修改分类
    const newCategories = [];
    allMeta.categories.forEach((r) => {
      if (r === name) {
        newCategories.push(newName);
      } else {
        newCategories.push(r);
      }
    });
    this.metaProvider.update({ categories: newCategories });
  }
}
