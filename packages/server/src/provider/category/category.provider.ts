import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ArticleProvider } from '../article/article.provider';
import { CategoryDocument } from 'src/scheme/category.schema';
import { sleep } from 'src/utils/sleep';
import { UpdateCategoryDto } from 'src/types/category.dto';

@Injectable()
export class CategoryProvider {
  idLock = false;
  constructor(
    @InjectModel('Category') private categoryModal: Model<CategoryDocument>,
    private readonly articleProvider: ArticleProvider,
  ) {}
  async getCategoriesWithArticle(includeHidden: boolean) {
    const allArticles = await this.articleProvider.getAll('list', includeHidden);
    const categories = await this.getAllCategories();
    const data = {};
    categories.forEach((c) => {
      data[c] = [];
    });
    allArticles.forEach((a) => {
      data[a.category]?.push(a);
    });
    return data;
  }
  async getPieData() {
    const oldData = await this.getCategoriesWithArticle(true);
    const categories = Object.keys(oldData);
    if (!categories || categories.length < 0) {
      return [];
    }
    const res = [];
    categories.forEach((c) => {
      res.push({
        type: c,
        value: oldData[c].length || 0,
      });
    });
    return res;
  }

  async getAllCategories(all?: boolean) {
    const d = await this.categoryModal.find({});
    if (!d || !d.length) {
      return [];
    }
    if (all) return d;
    else return d.map((item) => item.name);
  }

  async getArticlesByCategory(name: string, includeHidden: boolean) {
    const d = await this.getCategoriesWithArticle(includeHidden);
    return d[name] ?? [];
  }

  async addOne(name: string) {
    const existData = await this.categoryModal.findOne({
      name,
    });
    if (existData) {
      throw new NotAcceptableException('分类名重复，无法创建！');
    } else {
      await this.categoryModal.create({
        id: await this.getNewId(),
        name,
        type: 'category',
        private: false,
      });
    }
  }

  async getNewId() {
    while (this.idLock) {
      await sleep(10);
    }
    this.idLock = true;
    const maxObj = await this.categoryModal.find({}).sort({ id: -1 }).limit(1);
    let res = 1;
    if (maxObj.length) {
      res = maxObj[0].id + 1;
    }
    this.idLock = false;
    return res;
  }

  async deleteOne(name: string) {
    // 先检查一下有没有这个分类的文章
    const d = await this.getArticlesByCategory(name, true);
    if (d && d.length) {
      throw new NotAcceptableException('分类已有文章，无法删除！');
    }
    await this.categoryModal.deleteOne({
      name,
    });
  }

  async updateCategoryByName(name: string, dto: UpdateCategoryDto) {
    if (Object.keys(dto).length == 0) {
      throw new NotAcceptableException('无有效信息，无法修改！');
    }
    if (dto.name && name != dto.name) {
      const existData = await this.categoryModal.findOne({
        name: dto.name,
      });
      if (existData) {
        throw new NotAcceptableException('分类名重复，无法修改！');
      }
      // 先修改文章分类
      const articles = await this.getArticlesByCategory(name, true);
      if (articles && articles.length) {
        for (const article of articles) {
          await this.articleProvider.updateById(article.id, {
            category: dto.name,
          });
        }
      }
    }
    await this.categoryModal.updateOne(
      {
        name: name,
      },
      {
        ...dto,
      },
    );
  }
}
