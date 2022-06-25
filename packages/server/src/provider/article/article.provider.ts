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

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const createdData = new this.articleModel(createArticleDto);
    const newId = await this.getNewId();
    createdData.id = newId;
    return createdData.save();
  }

  async getAll(): Promise<Article[]> {
    const articles = await this.articleModel.find({ hiden: false }).exec();
    return articles.filter((each) => {
      return !each?.deleted;
    });
  }

  async getById(id: number): Promise<Article> {
    const article = await this.articleModel
      .findOne({ id, hiden: false })
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

  async searchByString(str: string): Promise<Article[]> {
    return this.articleModel
      .find({
        $or: [
          { content: { $regex: `*${str}*`, $options: '$i' } },
          { title: { $regex: `*${str}*`, $options: '$i' } },
        ],
      })
      .exec();
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
