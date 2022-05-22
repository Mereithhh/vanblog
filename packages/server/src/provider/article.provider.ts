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
    return this.articleModel.find({ hiden: false, deleted: false }).exec();
  }

  async getById(id: number): Promise<Article> {
    return this.articleModel
      .findOne({ id, hiden: false, deleted: false })
      .exec();
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
    return this.articleModel.find().exec();
  }
  async deleteById(id: number) {
    return this.articleModel.updateOne({ id }, { deleted: true }).exec();
  }

  async updateById(id: number, updateArticleDto: UpdateArticleDto) {
    return this.articleModel.updateOne({ id }, updateArticleDto);
  }

  async getNewId() {
    const maxObj = await this.articleModel.findOne().sort('createdAt').exec();
    if (maxObj) {
      return maxObj.id + 1;
    } else {
      return 1;
    }
  }
}
