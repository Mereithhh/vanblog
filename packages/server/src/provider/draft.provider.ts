import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateArticleDto, UpdateArticleDto } from 'src/dto/article.dto';
import { CreateDraftDto, UpdateDraftDto } from 'src/dto/draft.dto';
import { Article, ArticleDocument } from 'src/scheme/article.schema';
import { Draft, DraftDocument } from 'src/scheme/draft.schema';

@Injectable()
export class DraftProvider {
  constructor(@InjectModel('Draft') private draftModel: Model<DraftDocument>) {}

  async create(createDraftDto: CreateDraftDto): Promise<Draft> {
    const createdData = new this.draftModel(createDraftDto);
    const newId = await this.getNewId();
    createdData.id = newId;
    return createdData.save();
  }

  async getAll(): Promise<Draft[]> {
    return this.draftModel.find({ deleted: false }).exec();
  }

  async getById(id: number): Promise<Draft> {
    return this.draftModel.findOne({ id, deleted: false }).exec();
  }
  async findById(id: number): Promise<Draft> {
    return this.draftModel.findOne({ id }).exec();
  }

  async searchByString(str: string): Promise<Draft[]> {
    return this.draftModel
      .find({
        $or: [
          { content: { $regex: `*${str}*`, $options: '$i' } },
          { title: { $regex: `*${str}*`, $options: '$i' } },
        ],
      })
      .exec();
  }

  async findAll(): Promise<Draft[]> {
    return this.draftModel.find().exec();
  }
  async deleteById(id: number) {
    return this.draftModel.updateOne({ id }, { deleted: true }).exec();
  }

  async updateById(id: number, updateDraftDto: UpdateDraftDto) {
    return this.draftModel.updateOne({ id }, updateDraftDto);
  }

  async getNewId() {
    const maxObj = await this.draftModel.findOne().sort('createdAt').exec();
    if (maxObj) {
      return maxObj.id + 1;
    } else {
      return 1;
    }
  }
}
