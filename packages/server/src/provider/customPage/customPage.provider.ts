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
    const id = (dto as CustomPage & { _id?: unknown })._id;
    const update: Partial<CustomPage> = { updatedAt: new Date() };
    if (dto.name != null) {
      update.name = dto.name;
    }
    if (dto.path != null) {
      update.path = dto.path;
    }
    if (dto.type != null) {
      update.type = dto.type;
    }
    if (dto.html != null) {
      update.html = dto.html;
    }

    if (id && dto.path) {
      const conflict = await this.customPageModal.findOne({ path: dto.path });
      if (conflict && String(conflict._id) !== String(id)) {
        throw new ForbiddenException('已有此路由的自定义页面！无法重复创建！');
      }
    }

    // 修改信息 may change path; look up by _id so the write still hits the row.
    // HTML-only saves from the editor also send _id. Path is a fallback.
    const filter = id ? { _id: id } : { path: dto.path };
    return await this.customPageModal.updateOne(filter, update);
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
