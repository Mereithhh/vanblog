import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateArticleDto } from 'src/types/article.dto';
import {
  CreateDraftDto,
  PublishDraftDto,
  SearchDraftOption,
  UpdateDraftDto,
} from 'src/types/draft.dto';
import { Draft, DraftDocument } from 'src/scheme/draft.schema';
import { ArticleProvider } from '../article/article.provider';
import { sleep } from 'src/utils/sleep';
export type DraftView = 'admin' | 'public' | 'list';
@Injectable()
export class DraftProvider {
  idLock = false;
  constructor(
    @InjectModel('Draft') private draftModel: Model<DraftDocument>,
    private readonly articleProvider: ArticleProvider,
  ) {}
  publicView = {
    title: 1,
    content: 1,
    tags: 1,
    category: 1,
    updatedAt: 1,
    createdAt: 1,
    author: 1,
    id: 1,
    _id: 0,
  };

  adminView = {
    title: 1,
    content: 1,
    tags: 1,
    category: 1,
    updatedAt: 1,
    createdAt: 1,
    author: 1,
    id: 1,
    _id: 0,
  };

  listView = {
    title: 1,
    tags: 1,
    category: 1,
    updatedAt: 1,
    createdAt: 1,
    author: 1,
    id: 1,
    _id: 0,
  };

  getView(view: DraftView) {
    let thisView: any = this.adminView;
    switch (view) {
      case 'admin':
        thisView = this.adminView;
        break;
      case 'list':
        thisView = this.listView;
        break;
      case 'public':
        thisView = this.publicView;
    }
    return thisView;
  }
  async create(createDraftDto: CreateDraftDto): Promise<Draft> {
    const createdData = new this.draftModel(createDraftDto);
    const newId = await this.getNewId();
    createdData.id = newId;
    return createdData.save();
  }
  async importDrafts(drafts: Draft[]) {
    // 题目相同就合并，以导入的优先
    // for (let i = 0; i < drafts.length; i++) {
    //   const newId = await this.getNewId();
    //   drafts[i].id = newId;
    // }
    for (const draft of drafts) {
      const { id, ...createDto } = draft;
      const title = draft.title;
      const oldDraft = await this.findOneByTitle(title);
      if (oldDraft) {
        this.updateById(oldDraft.id, { ...createDto, deleted: false });
      } else {
        await this.create(createDto);
      }
    }
  }

  async getByOption(option: SearchDraftOption): Promise<{ drafts: Draft[]; total: number }> {
    const query: any = {};
    const $and: any = [
      {
        $or: [
          {
            deleted: false,
          },
          {
            deleted: { $exists: false },
          },
        ],
      },
    ];
    const and = [];
    const sort: any = { createdAt: -1 };
    if (option.sortCreatedAt) {
      if (option.sortCreatedAt == 'asc') {
        sort.createdAt = 1;
      }
    }
    if (option.tags) {
      const tags = option.tags.split(',');
      const or: any = [];
      tags.forEach((t) => {
        or.push({
          tags: { $regex: `${t}`, $options: 'i' },
        });
      });
      and.push({ $or: or });
    }
    if (option.category) {
      and.push({
        category: { $regex: `${option.category}`, $options: 'i' },
      });
    }
    if (option.title) {
      and.push({
        title: { $regex: `${option.title}`, $options: 'i' },
      });
    }
    if (option.startTime || option.endTime) {
      const obj: any = {};
      if (option.startTime) {
        obj['$gte'] = new Date(option.startTime);
      }
      if (option.endTime) {
        obj['$lte'] = new Date(option.endTime);
      }
      $and.push({ createdAt: obj });
    }

    if (and.length) {
      $and.push({ $and: and });
    }

    query.$and = $and;
    const view = option.toListView ? this.listView : this.adminView;

    const drafts = await this.draftModel
      .find(query, view)
      .sort(sort)
      .skip(option.pageSize * option.page - option.pageSize)
      .limit(option.pageSize)
      .exec();
    const total = await this.draftModel.count(query).exec();

    return {
      drafts,
      total,
    };
  }
  async publish(id: number, options: PublishDraftDto) {
    const draft = await this.getById(id);
    if (!draft.content.includes('<!-- more -->')) {
      throw new ForbiddenException('未包含 more 标记，请修改后再发布！');
    }
    const createArticleDto: CreateArticleDto = {
      title: draft.title,
      content: draft.content,
      tags: draft.tags,
      category: draft.category,
      author: draft.author,
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
  async findOneByTitle(title: string): Promise<Draft> {
    return this.draftModel.findOne({ title }).exec();
  }

  async searchByString(str: string): Promise<Draft[]> {
    return this.draftModel
      .find({
        $or: [
          { content: { $regex: `*${str}*`, $options: 'i' } },
          { title: { $regex: `*${str}*`, $options: 'i' } },
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
    return this.draftModel.updateOne({ id }, { ...updateDraftDto, updatedAt: new Date() });
  }

  async getNewId() {
    while (this.idLock) {
      await sleep(10);
    }
    this.idLock = true;
    const maxObj = await this.draftModel.find({}).sort({ id: -1 }).limit(1);
    let res = 1;
    if (maxObj.length) {
      res = maxObj[0].id + 1;
    }
    this.idLock = false;
    return res;
  }
}
