import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateArticleDto,
  SearchArticleOption,
  UpdateArticleDto,
} from 'src/dto/article.dto';
import { Article, ArticleDocument } from 'src/scheme/article.schema';
import { wordCount } from 'src/utils/wordCount';
import { MetaProvider } from '../meta/meta.provider';

export type ArticleView = 'admin' | 'public' | 'list';

@Injectable()
export class ArticleProvider {
  constructor(
    @InjectModel('Article')
    private articleModel: Model<ArticleDocument>,
    @Inject(forwardRef(() => MetaProvider))
    private readonly metaProvider: MetaProvider,
  ) {}
  publicView = {
    title: 1,
    content: 1,
    tags: 1,
    category: 1,
    updateAt: 1,
    createdAt: 1,
    id: 1,
    top: 1,
    _id: 0,
  };

  adminView = {
    title: 1,
    content: 1,
    tags: 1,
    category: 1,
    updateAt: 1,
    createdAt: 1,
    id: 1,
    top: 1,
    hidden: 1,
    password: 1,
    private: 1,
    _id: 0,
  };

  listView = {
    title: 1,
    tags: 1,
    category: 1,
    updateAt: 1,
    createdAt: 1,
    id: 1,
    top: 1,
    hidden: 1,
    password: 1,
    private: 1,
    _id: 0,
  };

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
        top: item.top,
      };
    });
  }
  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const createdData = new this.articleModel(createArticleDto);
    const newId = await this.getNewId();
    createdData.id = newId;
    this.metaProvider.updateTotalWords();
    return createdData.save();
  }

  async importArticles(articles: Article[]) {
    // 先获取一遍新的 id
    // for (let i = 0; i < articles.length; i++) {
    //   const newId = await this.getNewId();
    //   articles[i].id = newId;
    // }

    // 题目相同就合并，以导入的优先
    for (const a of articles) {
      const { id, ...createDto } = a;
      const title = a.title;
      const oldArticle = await this.findOneByTitle(title);
      if (oldArticle) {
        this.updateById(oldArticle.id, { ...createDto, deleted: false });
      } else {
        await this.create(createDto);
      }
    }
    this.metaProvider.updateTotalWords();
  }

  async countTotalWords() {
    //TODO 每次更新文章保存最新字数
    let total = 0;
    const articles = await this.articleModel
      .find({
        $or: [
          {
            deleted: false,
          },
          {
            deleted: { $exists: false },
          },
        ],
      })
      .exec();
    articles.forEach((a) => {
      total = total + wordCount(a.content);
    });
    return total;
  }
  async getTotalNum() {
    return await this.articleModel
      .find({
        $or: [
          {
            deleted: false,
          },
          {
            deleted: { $exists: false },
          },
        ],
      })
      .count();
  }

  getView(view: ArticleView) {
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

  async getAll(view: ArticleView): Promise<Article[]> {
    const thisView: any = this.getView(view);
    const articles = await this.articleModel
      .find(
        {
          hidden: false,
          $or: [
            {
              deleted: false,
            },
            {
              deleted: { $exists: false },
            },
          ],
        },
        thisView,
      )
      .exec();
    return articles;
  }
  async getByOption(
    option: SearchArticleOption,
  ): Promise<{ articles: Article[]; total: number }> {
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
    if (option.sortTop) {
      if (option.sortTop == 'asc') {
        sort.top = 1;
      } else {
        sort.top = -1;
      }
    }
    if (option.tags) {
      const tags = option.tags.split(',');
      const or: any = [];
      tags.forEach((t) => {
        or.push({
          tags: { $regex: `${t}`, $options: '$i' },
        });
      });
      and.push({ $or: or });
    }
    if (option.category) {
      and.push({
        category: { $regex: `${option.category}`, $options: '$i' },
      });
    }
    if (option.title) {
      and.push({
        title: { $regex: `${option.title}`, $options: '$i' },
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

    const articles = await this.articleModel
      .find(query, view)
      .sort(sort)
      .skip(option.pageSize * option.page - option.pageSize)
      .limit(option.pageSize)
      .exec();
    const total = await this.articleModel.count(query).exec();

    return {
      articles,
      total,
    };
  }

  async getById(id: number, view: ArticleView): Promise<Article> {
    return await this.articleModel
      .findOne(
        {
          id,
          $or: [
            {
              deleted: false,
            },
            {
              deleted: { $exists: false },
            },
          ],
        },
        this.getView(view),
      )
      .exec();
  }

  async findOneByTitle(title: string): Promise<Article> {
    return this.articleModel.findOne({ title }).exec();
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
    const s = str.toLocaleLowerCase();
    const titleData = rawData.filter((each) =>
      each.title.toLocaleLowerCase().includes(s),
    );
    const contentData = rawData.filter((each) =>
      each.content.toLocaleLowerCase().includes(s),
    );
    const categoryData = rawData.filter((each) =>
      each.category.toLocaleLowerCase().includes(s),
    );
    const tagData = rawData.filter((each) =>
      each.tags.map((t) => t.toLocaleLowerCase()).includes(s),
    );
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
    const res = await this.articleModel
      .updateOne({ id }, { deleted: true })
      .exec();
    this.metaProvider.updateTotalWords();
    return res;
  }

  async updateById(id: number, updateArticleDto: UpdateArticleDto) {
    const res = await this.articleModel.updateOne(
      { id },
      { ...updateArticleDto, updatedAt: new Date() },
    );
    this.metaProvider.updateTotalWords();
    return res;
  }

  async getNewId() {
    const maxObj = await this.articleModel.find({}).sort({ id: -1 }).exec();
    if (maxObj.length) {
      return maxObj[0].id + 1;
    } else {
      return 1;
    }
  }
}
