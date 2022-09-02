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
} from 'src/types/article.dto';
import { Article, ArticleDocument } from 'src/scheme/article.schema';
import { parseImgLinksOfMarkdown } from 'src/utils/parseImgOfMarkdown';
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
    private: 1,
    hidden: 1,
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
  async create(
    createArticleDto: CreateArticleDto,
    skipUpdateWordCount?: boolean,
  ): Promise<Article> {
    const createdData = new this.articleModel(createArticleDto);
    const newId = await this.getNewId();
    createdData.id = newId;
    if (!skipUpdateWordCount) {
      this.metaProvider.updateTotalWords('新建文章');
    }
    return createdData.save();
  }
  async searchArticlesByLink(link: string) {
    const artciles = await this.articleModel.find(
      {
        content: { $regex: link, $options: '$i' },
        $or: [
          {
            deleted: false,
          },
          {
            deleted: { $exists: false },
          },
        ],
      },
      this.listView,
    );
    return artciles;
  }
  async getAllImageLinks() {
    const res = [];
    const articles = await this.articleModel.find({
      $or: [
        {
          deleted: false,
        },
        {
          deleted: { $exists: false },
        },
      ],
    });
    for (const article of articles) {
      const eachLinks = parseImgLinksOfMarkdown(article.content || '');
      res.push({
        articleId: article.id,
        title: article.title,
        links: eachLinks,
      });
    }
    return res;
  }

  async updateViewer(id: number, isNew: boolean) {
    const article = await this.getById(id, 'list');
    if (!article) {
      return;
    }
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
    const articles = await this.getAll('list', true);
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

  async washViewerInfoToVisitProvider() {
    // 用 visitProvider 里面的数据洗一下 article 的。
    const articles = await this.getAll('list', true);
    for (const a of articles) {
      await this.visitProvider.rewriteToday(
        `/post/${a.id}`,
        a.viewer,
        a.visited,
      );
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
        this.updateById(
          oldArticle.id,
          {
            ...createDto,
            deleted: false,
            updatedAt: oldArticle.updatedAt || oldArticle.createdAt,
          },
          true,
        );
      } else {
        await this.create(
          {
            ...createDto,
            updatedAt: createDto.updatedAt || createDto.createdAt || new Date(),
          },
          true,
        );
      }
    }
    this.metaProvider.updateTotalWords('导入文章');
  }

  async countTotalWords() {
    //! 默认不保存 hidden 文章的！
    let total = 0;
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
      {
        $or: [
          {
            hidden: false,
          },
          {
            hidden: { $exists: false },
          },
        ],
      },
    ];
    const articles = await this.articleModel
      .find({
        $and,
      })
      .exec();
    articles.forEach((a) => {
      total = total + wordCount(a.content);
    });
    return total;
  }
  async getTotalNum(includeHidden: boolean) {
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
    if (!includeHidden) {
      $and.push({
        $or: [
          {
            hidden: false,
          },
          {
            hidden: { $exists: false },
          },
        ],
      });
    }
    return await this.articleModel
      .find({
        $and,
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

  async getAll(
    view: ArticleView,
    includeHidden: boolean,
    includeDelete?: boolean,
  ): Promise<Article[]> {
    const thisView: any = this.getView(view);
    const $and: any = [];
    if (!includeDelete) {
      $and.push({
        $or: [
          {
            deleted: false,
          },
          {
            deleted: { $exists: false },
          },
        ],
      });
    }
    if (!includeHidden) {
      $and.push({
        $or: [
          {
            hidden: false,
          },
          {
            hidden: { $exists: false },
          },
        ],
      });
    }

    const articles = await this.articleModel
      .find(
        $and.length > 0
          ? {
              $and,
            }
          : undefined,
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
            {
              $or: [
                {
                  hidden: false,
                },
                {
                  hidden: { $exists: false },
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
    isPublic: boolean,
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
    let sort: any = { createdAt: -1 };
    if (isPublic) {
      $and.push({
        $or: [
          {
            hidden: false,
          },
          {
            hidden: { $exists: false },
          },
        ],
      });
    }

    if (option.sortTop) {
      if (option.sortTop == 'asc') {
        sort = { top: 1 };
      } else {
        sort = { top: -1 };
      }
    }
    if (option.sortViewer) {
      if (option.sortViewer == 'asc') {
        sort = { viewer: 1 };
      } else {
        sort = { viewer: -1 };
      }
    }
    if (option.sortCreatedAt) {
      if (option.sortCreatedAt == 'asc') {
        sort = { createdAt: 1 };
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
    // console.log(JSON.stringify(query, null, 2));
    // console.log(JSON.stringify(sort, null, 2));
    let view: any = isPublic ? this.publicView : this.adminView;
    if (option.toListView) {
      view = this.listView;
    }
    if (option.withWordCount) {
      view = isPublic ? this.publicView : this.adminView;
    }
    let articlesQuery = this.articleModel.find(query, view).sort(sort);
    if (option.pageSize != -1 && !isPublic) {
      articlesQuery = articlesQuery
        .skip(option.pageSize * option.page - option.pageSize)
        .limit(option.pageSize);
    }

    let articles = await articlesQuery.exec();
    // public 下 包括所有的，
    if (isPublic && option.pageSize != -1) {
      // 把 top 的诺到前面去
      const topArticles = articles.filter((a: any) => {
        const top = a?._doc?.top || a?.top;
        return Boolean(top) && top != '';
      });
      const notTopArticles = articles.filter((a: any) => {
        const top = a?._doc?.top || a?.top;
        return !Boolean(top) || top == '';
      });
      const sortedTopArticles = topArticles.sort((a: any, b: any) => {
        const topA = a?._doc?.top || a?.top;
        const topB = b?._doc?.top || b?.top;
        if (topA > topB) {
          return -1;
        } else if (topB > topA) {
          return 1;
        } else {
          return 0;
        }
      });
      articles = [...sortedTopArticles, ...notTopArticles];
      const skip = option.pageSize * option.page - option.pageSize;
      const rawEnd = skip + option.pageSize;
      const end = rawEnd > articles.length - 1 ? articles.length : rawEnd;
      articles = articles.slice(skip, end);
    }
    // withWordCount 只会返回当前分页的文字数量

    const total = await this.articleModel.count(query).exec();
    // 过滤私有文章
    if (isPublic) {
      articles = articles.map((a: any) => {
        const isPrivate = a?._doc?.private || a?.private;
        if (isPrivate) {
          return {
            ...(a?._doc || a),
            content: undefined,
            password: undefined,
          };
        } else {
          return { ...(a?._doc || a) };
        }
      });
    }
    const resData: any = {};
    if (option.withWordCount) {
      let totalWordCount = 0;
      articles.forEach((a) => {
        totalWordCount = totalWordCount + wordCount(a?.content || '');
      });
      resData.totalWordCount = totalWordCount;
    }
    if (option.withWordCount && option.toListView) {
      // 重置视图
      resData.articles = articles.map((a: any) => ({
        ...(a?._doc || a),
        content: undefined,
        password: undefined,
      }));
    } else {
      resData.articles = articles;
    }

    resData.total = total;
    return resData;
  }

  async getById(id: number, view: ArticleView): Promise<Article> {
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

    return await this.articleModel
      .findOne(
        {
          id,
          $and,
        },
        this.getView(view),
      )
      .exec();
  }
  async getByIdWithPassword(id: number, password: string): Promise<any> {
    const article: any = await this.getById(id, 'admin');
    if (!password) {
      return null;
    }
    if (!article) {
      return null;
    }
    if (!article.password || article.password == '') {
      return { ...(article?._doc || article), password: undefined };
    } else {
      if (article.password == password) {
        return { ...(article?._doc || article), password: undefined };
      } else {
        return null;
      }
    }
  }
  async getByIdWithPreNext(id: number, view: ArticleView) {
    const curArticle = await this.getById(id, view);
    if (!curArticle) {
      throw new NotFoundException('找不到文章');
    }

    if (curArticle.hidden) {
      const siteInfo = await this.metaProvider.getSiteInfo();
      if (
        !siteInfo?.allowOpenHiddenPostByUrl ||
        siteInfo?.allowOpenHiddenPostByUrl == 'false'
      ) {
        throw new NotFoundException('该文章是隐藏文章！');
      }
    }
    if (curArticle.private) {
      curArticle.content = undefined;
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
  async getPreArticleByArticle(
    article: Article,
    view: ArticleView,
    includeHidden?: boolean,
  ) {
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
      { createdAt: { $lt: article.createdAt } },
    ];
    if (!includeHidden) {
      $and.push({
        $or: [
          {
            hidden: false,
          },
          {
            hidden: { $exists: false },
          },
        ],
      });
    }
    const result = await this.articleModel
      .find(
        {
          $and,
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
  async getNextArticleByArticle(
    article: Article,
    view: ArticleView,
    includeHidden?: boolean,
  ) {
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
      { createdAt: { $gt: article.createdAt } },
    ];
    if (!includeHidden) {
      $and.push({
        $or: [
          {
            hidden: false,
          },
          {
            hidden: { $exists: false },
          },
        ],
      });
    }
    const result = await this.articleModel
      .find(
        {
          $and,
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

  async searchByString(
    str: string,
    includeHidden: boolean,
  ): Promise<Article[]> {
    const $and: any = [
      {
        $or: [
          { content: { $regex: `${str}`, $options: '$i' } },
          { title: { $regex: `${str}`, $options: '$i' } },
          { category: { $regex: `${str}`, $options: '$i' } },
          { tags: { $regex: `${str}`, $options: '$i' } },
        ],
      },
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
    if (!includeHidden) {
      $and.push({
        $or: [
          {
            hidden: false,
          },
          {
            hidden: { $exists: false },
          },
        ],
      });
    }
    const rawData = await this.articleModel
      .find({
        $and,
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
    this.metaProvider.updateTotalWords('删除文章');
    return res;
  }

  async updateById(
    id: number,
    updateArticleDto: UpdateArticleDto,
    skipUpdateWordCount?: boolean,
  ) {
    const res = await this.articleModel.updateOne(
      { id },
      {
        ...updateArticleDto,
        updatedAt: updateArticleDto.updatedAt || new Date(),
      },
    );
    if (!skipUpdateWordCount) {
      this.metaProvider.updateTotalWords('更新文章');
    }
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
