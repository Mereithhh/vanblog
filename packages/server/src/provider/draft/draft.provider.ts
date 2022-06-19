import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateArticleDto } from 'src/dto/article.dto';
import {
  CreateDraftDto,
  PublishDraftDto,
  UpdateDraftDto,
} from 'src/dto/draft.dto';
import { Draft, DraftDocument } from 'src/scheme/draft.schema';
import { AritcleProvider } from '../article/article.provider';

@Injectable()
export class DraftProvider {
  constructor(
    @InjectModel('Draft') private draftModel: Model<DraftDocument>,
    private readonly articleProvider: AritcleProvider,
  ) {}

  async create(createDraftDto: CreateDraftDto): Promise<Draft> {
    const createdData = new this.draftModel(createDraftDto);
    const newId = await this.getNewId();
    createdData.id = newId;
    return createdData.save();
  }
  async publish(id: number, options: PublishDraftDto) {
    const draft = await this.getById(id);
    const createArticleDto: CreateArticleDto = {
      title: draft.title,
      content: draft.content,
      tags: draft.tags,
      category: draft.category,
      desc: draft.desc,
    };
    for (const [k, v] of Object.entries(options || {})) {
      createArticleDto[k] = v;
    }
    const res = await this.articleProvider.create(createArticleDto);
    await this.deleteById(id);
    return res;
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
    const maxObj = await this.draftModel
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
