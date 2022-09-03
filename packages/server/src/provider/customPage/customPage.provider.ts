import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomPage, CustomPageDocument } from 'src/scheme/customPage.schema';

@Injectable()
export class CustomPageProvider {
  constructor(
    @InjectModel('CustomPage')
    private customPageModal: Model<CustomPageDocument>,
  ) {}
  async createCustomPage(dto: CustomPage) {
    const old = await this.customPageModal.findOne({ path: dto.path });
    if (old) {
      throw new ForbiddenException('已有此路由的自定义页面！无法重复创建！');
    }
    return await this.customPageModal.create(dto);
  }
  async updateCustomPage(dto: CustomPage) {
    return await this.customPageModal.updateOne({ path: dto.path }, { ...dto });
  }
  async getCustomPageByPath(path: string) {
    return await this.customPageModal.findOne({ path });
  }
  async getAll() {
    return await this.customPageModal.find({}, { html: 0 });
  }
  async deleteByPath(path: string) {
    return await this.customPageModal.deleteOne({ path });
  }
}
