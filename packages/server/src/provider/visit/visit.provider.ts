import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { Model } from 'mongoose';
import { createVisitDto } from 'src/dto/visit.dto';
import { Visit } from 'src/scheme/visit.schema';
import { VisitDocument } from 'src/scheme/visit.schema';

@Injectable()
export class VisitProvider {
  constructor(@InjectModel('Visit') private visitModel: Model<VisitDocument>) {}

  async add(createViewerDto: createVisitDto): Promise<any> {
    // 先找一下有没有今天的，有的话就在今天的基础上加1。
    const { isNew, pathname } = createViewerDto;
    // 这里的 isNew 代表是对于这个文章来说有没有访问过。
    const today = dayjs().format('YYYY-MM-DD');
    const todayData = await this.findByDateAndPath(today, pathname);
    if (todayData) {
      // 有今天的，直接在今天的基础上 +1 就行了
      return await this.visitModel.updateOne(
        { _id: todayData._id },
        {
          viewer: todayData.viewer + 1,
          visited: isNew ? todayData.visited + 1 : todayData.visited,
          lastVisitedTime: new Date(),
        },
      );
    } else {
      // 没有今天的，找到能找到的上一天，然后加一，并创建今天的。
      const lastData = await this.getLastData(pathname);
      const lastVisit = lastData?.visited || 0;
      const lastViewer = lastData?.viewer || 0;
      const createdData = new this.visitModel({
        date: today,
        viewer: lastViewer + 1,
        visited: isNew ? lastVisit + 1 : lastVisit,
        pathname: pathname,
        lastVisitedTime: new Date(),
      });
      return await createdData.save();
    }
  }

  async getLastData(pathname: string) {
    const lastDay = dayjs().add(-1, 'day').format('YYYY-MM-DD');
    const lastData = await this.findByDateAndPath(lastDay, pathname);
    if (lastData) {
      return lastData;
    }
    return null;
  }

  async getAll(): Promise<Visit[]> {
    return this.visitModel.find({}).exec();
  }

  async findByDateAndPath(date: string, pathname: string): Promise<Visit> {
    return this.visitModel.findOne({ date, pathname }).exec();
  }
  async getByArticleId(id: number) {
    const pathname = id == 0 ? `/about` : `/post/${id}`;
    const today = dayjs().format('YYYY-MM-DD');
    const lastDay = dayjs().add(-1, 'day').format('YYYY-MM-DD');
    const result = await this.visitModel
      .find({
        date: { $in: [today, lastDay] },
        pathname,
      })
      .sort({ date: -1 })
      .limit(1);
    if (result && result.length) {
      return result[0];
    }
    return null;
  }
  async getLastVisitItem() {
    const today = dayjs().format('YYYY-MM-DD');
    const lastDay = dayjs().add(-1, 'day').format('YYYY-MM-DD');
    const result = await this.visitModel
      .find({
        date: { $in: [today, lastDay] },
        lastVisitedTime: { $exists: true },
      })
      .sort({ lastVisitedTime: -1 })
      .limit(1);
    if (result && result.length) {
      return result[0];
    }
    return null;
  }

  async import(data: Visit[]) {
    for (const each of data) {
      const oldData = await this.visitModel.findOne({
        pathname: each.pathname,
        date: each.date,
      });
      if (oldData) {
        await this.visitModel.updateOne({ _id: oldData._id }, each);
      } else {
        const newData = new this.visitModel(each);
        await newData.save();
      }
    }
  }
}
