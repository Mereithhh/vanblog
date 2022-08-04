import {
  Inject,
  Injectable,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
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
import { VisitProvider } from '../visit/visit.provider';

export type ArticleView = 'admin' | 'public' | 'list';

@Injectable()
export class ArticleProvider {
  constructor(
    @InjectModel('Article')
    private articleModel: Model<ArticleDocument>,
    @Inject(forwardRef(() => MetaProvider))
    private readonly metaProvider: MetaProvider,
    private readonly visitProvider: VisitProvider,
  ) {}
  publicView = {
    title: 1,
    content: 1,
    tags: 1,
    category: 1,
    updatedAt: 1,
    createdAt: 1,
    lastVisitedTime: 1,
    id: 1,
    top: 1,
    _id: 0,
    viewer: 1,
    visited: 1,
  };

  adminView = {
    title: 1,
    content: 1,
    tags: 1,
    category: 1,
    lastVisitedTime: 1,
    updatedAt: 1,
    createdAt: 1,
    id: 1,
    top: 1,
    hidden: 1,
    password: 1,
    private: 1,
    _id: 0,
    viewer: 1,
    visited: 1,
  };

  listView = {
    title: 1,
    tags: 1,
    category: 1,
    updatedAt: 1,
    lastVisitedTime: 1,
    createdAt: 1,
    id: 1,
    top: 1,
    hidden: 1,
    private: 1,
    _id: 0,
    viewer: 1,
    visited: 1,
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

  async updateViewer(id: number, isNew: boolean) {
    const article = await this.getById(id, 'list');
    const oldViewer = article.viewer || 0;
    const oldVIsited = article.visited || 0;
    const newViewer = oldViewer + 1;
    const newVisited = isNew ? oldVIsited + 1 : oldVIsited;
    const nowTime = new Date();
    await this.articleModel.updateOne(
      { id: id },
      { visited: newVisited, viewer: newViewer, lastVisitedTime: nowTime },
    );
  }

  async getRecentVisitedArticles(num: number, view: ArticleView) {
    return await this.articleModel
      .find(
        {
          lastVisitedTime: { $exists: true },
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
      .sort({ lastVisitedTime: -1 })
      .limit(num);
  }

  async getTopViewer(view: ArticleView, num: number) {
    return await this.articleModel
      .find(
        {
          viewer: { $ne: 0, $exists: true },
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
      .sort({ viewer: -1 })
      .limit(num);
  }
  async getTopVisited(view: ArticleView, num: number) {
    return await this.articleModel
      .find(
        {
          viewer: { $ne: 0, $exists: true },
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
      .sort({ visited: -1 })
      .limit(num);
  }

  async washViewerInfoByVisitProvider() {
    // 用 visitProvider 里面的数据洗一下 article 的。
    const articles = await this.getAll('list');
    for (const a of articles) {
      const visitData = await this.visitProvider.getByArticleId(a.id);
      if (visitData) {
        const updateDto = {
          viewer: visitData.viewer,
          visited: visitData.visited,
        };
        await this.updateById(a.id, updateDto);
      }
    }
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
        this.updateById(oldArticle.id, {
          ...createDto,
          deleted: false,
          updatedAt: oldArticle.updatedAt || oldArticle.createdAt,
        });
      } else {
        await this.create({
          ...createDto,
          updatedAt: createDto.updatedAt || createDto.createdAt || new Date(),
        });
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
      .sort({ createdAt: -1 })
      .exec();
    return articles;
  }

  async getTimeLineInfo() {
    // 肯定是不需要具体内容的，一个列表就好了
    const articles = await this.articleModel
      .find(
        {
          $and: [
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
          ],
        },
        this.listView,
      )
      .sort({ createdAt: -1 })
      .exec();
    // 清洗一下数据。
    const dates = Array.from(
      new Set(articles.map((a) => a.createdAt.getFullYear())),
    );
    const res: Record<string, Article[]> = {};
    dates.forEach((date) => {
      res[date] = articles.filter((a) => a.createdAt.getFullYear() == date);
    });
    return res;
  }
  async getByOption(
    option: SearchArticleOption,
  ): Promise<{ articles: Article[]; total: number; totalWordCount?: number }> {
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
    if (option.sortViewer) {
      if (option.sortViewer == 'asc') {
        sort.viewer = 1;
      } else {
        sort.viewer = -1;
      }
    }
    if (option.tags) {
      const tags = option.tags.split(',');
      const or: any = [];
      tags.forEach((t) => {
        if (option.regMatch) {
          or.push({
            tags: { $regex: `${t}`, $options: '$i' },
          });
        } else {
          or.push({
            tags: t,
          });
        }
      });
      and.push({ $or: or });
    }
    if (option.category) {
      if (option.regMatch) {
        and.push({
          category: { $regex: `${option.category}`, $options: '$i' },
        });
      } else {
        and.push({
          category: option.category,
        });
      }
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
    let view = option.toListView ? this.listView : this.adminView;
    if (option.withWordCount) {
      view = this.adminView;
    }
    let articlesQuery = this.articleModel.find(query, view).sort(sort);
    if (option.pageSize != -1) {
      articlesQuery = articlesQuery
        .skip(option.pageSize * option.page - option.pageSize)
        .limit(option.pageSize);
    }
    const articles = await articlesQuery.exec();
    // withWordCount 只会返回当前分页的文字数量

    const total = await this.articleModel.count(query).exec();
    const resData: any = {};
    if (option.withWordCount) {
      let totalWordCount = 0;
      articles.forEach((a) => {
        totalWordCount = totalWordCount + wordCount(a?.content || '');
      });
      resData.totalWordCount = totalWordCount;
    }
    // // 查找浏览量
    // if (option.withViewer) {
    //   const newArticles: any[] = [];
    //   for (let i = 0; i < articles.length; i++) {
    //     const eachViewerData = await this.visitProvider.getByArticleId(
    //       articles[i].id,
    //     );
    //     let viewerNum = 0;
    //     if (Boolean(eachViewerData)) {
    //       viewerNum = eachViewerData.viewer;
    //     }
    //     // 赋值
    //     const newArticle = copyDocObj(articles[i]);
    //     newArticle.viewer = viewerNum;
    //     newArticles.push(newArticle);
    //   }
    //   resData.articles = newArticles;
    // } else {
    // }

    resData.articles = articles;
    resData.total = total;
    return resData;
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
  async getByIdWithPreNext(id: number, view: ArticleView) {
    const curArticle = await this.getById(id, view);
    if (!curArticle) {
      throw new NotFoundException('找不到文章');
    }
    const res: any = { article: curArticle };
    // 找它的前一个和后一个。
    const preArticle = await this.getPreArticleByArticle(curArticle, 'list');
    const nextArticle = await this.getNextArticleByArticle(curArticle, 'list');
    if (preArticle) {
      res.pre = preArticle;
    }
    if (nextArticle) {
      res.next = nextArticle;
    }
    return res;
  }
  async getPreArticleByArticle(article: Article, view: ArticleView) {
    const result = await this.articleModel
      .find(
        {
          createdAt: { $lt: article.createdAt },
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
      .sort({ createdAt: -1 })
      .limit(1);
    if (result.length) {
      return result[0];
    }
    return null;
  }
  async getNextArticleByArticle(article: Article, view: ArticleView) {
    const result = await this.articleModel
      .find(
        {
          createdAt: { $gt: article.createdAt },
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
      .sort({ createdAt: 1 })
      .limit(1);
    if (result.length) {
      return result[0];
    }
    return null;
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
      {
        ...updateArticleDto,
        updatedAt: updateArticleDto.updatedAt || new Date(),
      },
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
