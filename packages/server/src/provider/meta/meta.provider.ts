import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meta, MetaDocument } from 'src/scheme/meta.schema';
import { UpdateSiteInfoDto } from 'src/dto/site.dto';
import { RewardItem } from 'src/dto/reward.dto';
import { SocialItem, SocialType } from 'src/dto/social.dto';
import { LinkItem } from 'src/dto/link.dto';
import { UserProvider } from '../user/user.provider';
import { MenuItem } from 'src/dto/menu.dto';
import { VisitProvider } from '../visit/visit.provider';
import { ArticleProvider } from '../article/article.provider';
import * as dayjs from 'dayjs';
@Injectable()
export class MetaProvider {
  constructor(
    @InjectModel('Meta')
    private metaModel: Model<MetaDocument>,
    private readonly userProvider: UserProvider,
    private readonly visitProvider: VisitProvider,
    @Inject(forwardRef(() => ArticleProvider))
    private readonly articleProvider: ArticleProvider,
  ) {}

  async updateTotalWords() {
    const total = await this.articleProvider.countTotalWords();
    await this.update({ totalWordCount: total });
    console.log(
      `[ ${dayjs().format(
        'YYYY-MM-DD HH:mm:ss',
      )} ]更新字数缓存：当前文章总字数: `,
      total,
    );
    return total;
  }

  async getViewer() {
    const old = await this.getAll();
    const ov = old.viewer || 0;
    const oldVisited = old.visited || 0;
    const newViewer = ov;
    const newVisited = oldVisited;
    return { visited: newVisited, viewer: newViewer };
  }
  async addViewer(isNew: boolean, pathname: string) {
    const old = await this.getAll();
    const ov = old.viewer || 0;
    const oldVisited = old.visited || 0;
    const newViewer = ov + 1;
    let newVisited = oldVisited;
    let isNewVisitor = false;
    if (typeof isNew == 'string') {
      if (isNew == 'true') {
        newVisited += 1;
        isNewVisitor = true;
      }
    }
    if (typeof isNew == 'boolean') {
      if (isNew == true) {
        newVisited += 1;
        isNewVisitor = true;
      }
    }
    await this.update({ viewer: newViewer, visited: newVisited });
    //增加每个路径的。

    this.visitProvider.add({ pathname: pathname, isNew: isNewVisitor });
    return { visited: newVisited, viewer: newViewer };
  }

  async getAll() {
    return this.metaModel.findOne().exec();
  }

  async getSocialTypes() {
    return [
      {
        label: '哔哩哔哩',
        value: 'bilibili',
      },
      {
        label: '邮箱',
        value: 'email',
      },
      {
        label: 'GitHub',
        value: 'github',
      },
      {
        label: '微信',
        value: 'wechat',
      },
      {
        label: '微信（暗色模式）',
        value: 'wechat-dark',
      },
    ];
  }
  async getTotalWords() {
    return (await this.getAll()).totalWordCount || 0;
  }

  async update(updateMetaDto: Partial<Meta>) {
    return this.metaModel.updateOne({}, updateMetaDto);
  }
  async getAbout() {
    return (await this.getAll()).about;
  }
  async getSiteInfo() {
    return (await this.getAll()).siteInfo;
  }
  async getRewards() {
    return (await this.getAll()).rewards;
  }
  async getSocials() {
    return (await this.getAll()).socials;
  }
  async getLinks() {
    return (await this.getAll()).links;
  }
  async getMenus() {
    return (await this.getAll()).menus;
  }
  async updateAbout(newContent: string) {
    return this.metaModel.updateOne(
      {},
      {
        about: {
          updatedAt: new Date(),
          content: newContent,
        },
      },
    );
  }

  async updateSiteInfo(updateSiteInfoDto: UpdateSiteInfoDto) {
    // @ts-ignore eslint-disable-next-line @typescript-eslint/ban-ts-comment
    const { name, password, ...updateDto } = updateSiteInfoDto;
    if (name && name != '') {
      this.userProvider.updateUser({ name: name, password });
    }

    return this.metaModel.updateOne({}, { siteInfo: updateDto });
  }

  async addOrUpdateReward(addReward: Partial<RewardItem>) {
    const meta = await this.getAll();
    const toAdd: RewardItem = {
      updatedAt: new Date(),
      value: addReward.value,
      name: addReward.name,
    };
    const newRewards = [];
    let pushed = false;

    meta.rewards.forEach((r) => {
      if (r.name === toAdd.name) {
        pushed = true;
        newRewards.push(toAdd);
      } else {
        newRewards.push(r);
      }
    });
    if (!pushed) {
      newRewards.push(toAdd);
    }

    return this.metaModel.updateOne({}, { rewards: newRewards });
  }

  async deleteReward(name: string) {
    const meta = await this.getAll();
    const newRewards = [];
    meta.rewards.forEach((r) => {
      if (r.name !== name) {
        newRewards.push(r);
      }
    });
    return this.metaModel.updateOne({}, { rewards: newRewards });
  }

  async deleteSocial(type: SocialType) {
    const meta = await this.getAll();
    const newSocials = [];
    meta.socials.forEach((r) => {
      if (r.type !== type) {
        newSocials.push(r);
      }
    });
    return this.metaModel.updateOne({}, { socials: newSocials });
  }

  async addOrUpdateSocial(addSocial: Partial<SocialItem>) {
    const meta = await this.getAll();
    const toAdd: SocialItem = {
      updatedAt: new Date(),
      value: addSocial.value,
      type: addSocial.type,
    };
    const newSocials = [];
    let pushed = false;
    meta.socials.forEach((r) => {
      if (r.type === toAdd.type) {
        pushed = true;
        newSocials.push(toAdd);
      } else {
        newSocials.push(r);
      }
    });
    if (!pushed) {
      newSocials.push(toAdd);
    }

    return this.metaModel.updateOne({}, { socials: newSocials });
  }
  async addOrUpdateLink(addLinkDto: Partial<LinkItem>) {
    const meta = await this.getAll();
    const toAdd: LinkItem = {
      updatedAt: new Date(),
      url: addLinkDto.url,
      name: addLinkDto.name,
    };
    const newLinks = [];
    let pushed = false;

    meta.links.forEach((r) => {
      if (r.name === toAdd.name) {
        pushed = true;
        newLinks.push(toAdd);
      } else {
        newLinks.push(r);
      }
    });
    if (!pushed) {
      newLinks.push(toAdd);
    }

    return this.metaModel.updateOne({}, { links: newLinks });
  }
  async addOrUpdateMemu(addMenuItemDto: Partial<MenuItem>) {
    const meta = await this.getAll();
    const toAdd: MenuItem = {
      value: addMenuItemDto.value,
      name: addMenuItemDto.name,
    };
    const newMenus = [];
    let pushed = false;

    meta.menus.forEach((r) => {
      if (r.name === toAdd.name) {
        pushed = true;
        newMenus.push(toAdd);
      } else {
        newMenus.push(r);
      }
    });
    if (!pushed) {
      newMenus.push(toAdd);
    }

    return this.metaModel.updateOne({}, { menus: newMenus });
  }
  async deleteLink(name: string) {
    const meta = await this.getAll();
    const newLinks = [];
    meta.links.forEach((r) => {
      if (r.name !== name) {
        newLinks.push(r);
      }
    });
    return this.metaModel.updateOne({}, { links: newLinks });
  }
  async deleteMenuItem(name: string) {
    const meta = await this.getAll();
    const newMemus = [];
    meta.menus.forEach((r) => {
      if (r.name !== name) {
        newMemus.push(r);
      }
    });
    return this.metaModel.updateOne({}, { menus: newMemus });
  }
}
