import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateArticleDto, UpdateArticleDto } from 'src/dto/article.dto';
import { Article, ArticleDocument } from 'src/scheme/article.schema';

@Injectable()
export class AritcleProvider {
  constructor(
    @InjectModel('Article') private articleModel: Model<ArticleDocument>,
  ) {}

  toPublic(oldArticles: Article[]) {
    return oldArticles.map((item) => {
      return {
        title: item.title,
        content: item.content,
        tags: item.tags,
        category: item.category,
        updatedAt: item.updatedAt,
        createdAt: item.createdAt,
        id: item.id,
      };
    });
  }
  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const createdData = new this.articleModel(createArticleDto);
    const newId = await this.getNewId();
    createdData.id = newId;
    return createdData.save();
  }

  async getAll(): Promise<Article[]> {
    const articles = await this.articleModel.find({ hidden: false }).exec();
    return articles.filter((each) => {
      if (!each.deleted) {
        return true;
      } else {
        return !each.deleted;
      }
    });
  }

  async getById(id: number): Promise<Article> {
    const article = await this.articleModel
      .findOne({ id, hidden: false })
      .exec();
    if (article?.deleted === true) {
      return null;
    } else {
      return article;
    }
  }
  async findById(id: number): Promise<Article> {
    return this.articleModel.findOne({ id }).exec();
  }

  toSearchResult(articles: Article[]) {
    return articles.map((each) => ({
      title: each.title,
      id: each.id,
      category: each.category,
      tags: each.tags,
      updatedAt: each.updatedAt,
      createdAt: each.createdAt,
    }));
  }

  async searchByString(str: string): Promise<Article[]> {
    const rawData = await this.articleModel
      .find({
        $or: [
          { content: { $regex: `${str}`, $options: '$i' } },
          { title: { $regex: `${str}`, $options: '$i' } },
          { category: { $regex: `${str}`, $options: '$i' } },
          { tags: { $regex: `${str}`, $options: '$i' } },
        ],
      })
      .exec();
    const titleData = rawData.filter((each) => each.title.includes(str));
    const contentData = rawData.filter((each) => each.content.includes(str));
    const categoryData = rawData.filter((each) => each.category.includes(str));
    const tagData = rawData.filter((each) => each.tags.includes(str));
    const sortedData = [
      ...titleData,
      ...contentData,
      ...tagData,
      ...categoryData,
    ];
    const resData = [];
    for (const e of sortedData) {
      if (!resData.includes(e)) {
        resData.push(e);
      }
    }
    return resData;
  }

  async findAll(): Promise<Article[]> {
    return this.articleModel.find({}).exec();
  }
  async deleteById(id: number) {
    return this.articleModel.updateOne({ id }, { deleted: true }).exec();
  }

  async updateById(id: number, updateArticleDto: UpdateArticleDto) {
    return this.articleModel.updateOne(
      { id },
      { ...updateArticleDto, updatedAt: new Date() },
    );
  }

  async getNewId() {
    const maxObj = await this.articleModel
      .find({})
      .sort({ createdAt: -1 })
      .exec();
    if (maxObj.length) {
      return maxObj[0].id + 1;
    } else {
      return 1;
    }
  }
}
