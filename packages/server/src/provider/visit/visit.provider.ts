import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Model } from 'mongoose';
import { createVisitDto } from 'src/dto/visit.dto';
import { Viewer } from 'src/scheme/viewer.schema';
import { VisitDocument } from 'src/scheme/visit.schema';

@Injectable()
export class VisitProvider {
  constructor(@InjectModel('Visit') private visitModel: Model<VisitDocument>) {}

  async add(createViewerDto: createVisitDto): Promise<any> {
    // 先找一下有没有今天的，有的话就在今天的基础上加1。
    const today = dayjs().format('YYY-MM-DD');
    const todayData = await this.findByDate(today);
    if (todayData) {
      // 有今天的，直接在今天的基础上 +1 就行了
      return await this.visitModel.updateOne(
        { _id: todayData._id },
        {
          viewer: todayData.viewer + 1,
          visited: todayData.visited + 1,
        },
      );
    } else {
      // 没有今天的，找到能找到的上一天，然后加一，并创建今天的。
      const lastData = await this.getLastData();
      const lastVisit = lastData.visited || 0;
      const lastViewer = lastData.viewer || 0;
      const createdData = new this.visitModel({
        date: today,
        viewer: lastViewer + 1,
        visited: lastVisit + 1,
        pathname: createViewerDto.pathname,
      });
      return await createdData.save();
    }
  }

  async getLastData() {
    const lastDay = dayjs().add(-1, 'day').format('YYY-MM-DD');
    const lastData = await this.findByDate(lastDay);
    if (lastData) {
      return lastData;
    }
    return null;
  }

  async getAll(): Promise<Viewer[]> {
    return this.visitModel.find({}).exec();
  }

  async findByDate(date: string): Promise<Viewer> {
    return this.visitModel.findOne({ date }).exec();
  }
}
