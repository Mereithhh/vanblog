import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createViewerDto } from 'src/dto/viewer.dto';
import { Viewer, ViewerDocument } from 'src/scheme/viewer.schema';
import dayjs from 'dayjs';
@Injectable()
export class ViewerProvider {
  constructor(
    @InjectModel('Viewer') private viewerModel: Model<ViewerDocument>,
  ) {}

  async create(createViewerDto: createViewerDto): Promise<Viewer> {
    const createdData = new this.viewerModel(createViewerDto);
    return createdData.save();
  }

  async createOrUpdate(createViewerDto: createViewerDto) {
    const { date } = createViewerDto;
    const oldData = await this.viewerModel.findOne({ date });
    if (!oldData) {
      const createdData = new this.viewerModel(createViewerDto);
      return createdData.save();
    } else {
      return this.viewerModel.updateOne({ date }, createViewerDto);
    }
  }

  async getViewerGrid(num: number) {
    const curDate = dayjs();
    const res = [];
    const today = { viewer: 0, visited: 0 };
    const lastDay = { viewer: 0, visited: 0 };
    for (let i = num; i >= 0; i--) {
      const last = curDate.add(-1 * i, 'day').format('YYYY-MM-DD');
      const lastDayData = await this.findByDate(last);
      if (i == 0) {
        if (lastDayData) {
          today.viewer = lastDayData.viewer;
          today.visited = lastDayData.visited;
        }
      }
      if (i == 1) {
        if (lastDayData) {
          lastDay.viewer = lastDayData.viewer;
          lastDay.visited = lastDayData.visited;
        }
        if (today.viewer == 0) {
          // 如果今天没数据，那今天的就和昨天的一样吧。这样新增就都是 0
          today.viewer = lastDayData?.viewer || 0;
          today.visited = lastDayData?.visited || 0;
        }
      }
      if (lastDayData) {
        res.push({
          date: last,
          visited: lastDayData.visited,
          viewer: lastDayData.viewer,
        });
      }
    }
    return {
      grid: res,
      add: {
        viewer: today.viewer - lastDay.viewer,
        visited: today.visited - lastDay.visited,
      },
      now: {
        viewer: today.viewer,
        visited: today.visited,
      },
    };
  }

  async getAll(): Promise<Viewer[]> {
    return this.viewerModel.find({}).exec();
  }

  async findByDate(date: string): Promise<Viewer> {
    return this.viewerModel.findOne({ date }).exec();
  }
  async import(data: Viewer[]) {
    for (const each of data) {
      const oldData = await this.viewerModel.findOne({
        date: each.date,
      });
      if (oldData) {
        await this.viewerModel.updateOne({ _id: oldData._id }, each);
      } else {
        const newData = new this.viewerModel(each);
        await newData.save();
      }
    }
  }
}
