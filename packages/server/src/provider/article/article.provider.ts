import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateArticleDto,
  SearchArticleOption,
  UpdateArticleDto,
} from 'src/dto/article.dto';
import { Article, ArticleDocument } from 'src/scheme/article.schema';
import { wordCount } from 'src/utils/wordCount';

@Injectable()
export class AritcleProvider {
  constructor(
    @InjectModel('Article') private articleModel: Model<ArticleDocument>,
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
  }

  async getTotalWordCount() {
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
  async getByOption(
    option: SearchArticleOption,
  ): Promise<{ articles: Article[]; total: number }> {
    const query: any = {};
    const $and = [
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
    const $or = [];
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
      tags.forEach((t) => {
        $or.push({
          tags: { $regex: `${t}`, $options: '$i' },
        });
      });
    }
    if (option.category) {
      $or.push({
        category: { $regex: `${option.category}`, $options: '$i' },
      });
    }
    if (option.title) {
      $or.push({
        title: { $regex: `${option.title}`, $options: '$i' },
      });
    }
    if ($or.length) {
      $and.push({ $or });
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
    return this.articleModel.updateOne({ id }, { deleted: true }).exec();
  }

  async updateById(id: number, updateArticleDto: UpdateArticleDto) {
    return this.articleModel.updateOne(
      { id },
      { ...updateArticleDto, updatedAt: new Date() },
    );
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
