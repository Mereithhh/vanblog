import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meta, MetaDocument } from 'src/scheme/meta.schema';
import { SiteInfo } from 'src/dto/site.dto';
import { RewardItem } from 'src/dto/reward.dto';
import { SocialItem, SocialType } from 'src/dto/social.dto';
import { LinkItem } from 'src/dto/link.dto';
@Injectable()
export class MetaProvider {
  constructor(@InjectModel('Meta') private metaModel: Model<MetaDocument>) {}

  async addViewer(isNew: boolean) {
    const old = await this.getAll();
    const ov = old.viewer || 0;
    const oldVisited = old.visited || 0;
    const newViewer = ov + 1;
    let newVisited = oldVisited;
    if (typeof isNew == 'string') {
      if (isNew == 'true') {
        newVisited += 1;
      }
    }
    if (typeof isNew == 'boolean') {
      if (isNew == true) {
        newVisited += 1;
      }
    }
    await this.update({ viewer: newViewer, visited: newVisited });
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
    ];
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

  async updateSiteInfo(updateSiteInfoDto: Partial<SiteInfo>) {
    return this.metaModel.updateOne({}, { siteInfo: updateSiteInfoDto });
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
}
