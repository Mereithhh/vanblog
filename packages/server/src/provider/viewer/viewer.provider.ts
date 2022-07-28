import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createViewerDto } from 'src/dto/viewer.dto';
import { Viewer, ViewerDocument } from 'src/scheme/viewer.schema';

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

  async getAll(): Promise<Viewer[]> {
    return this.viewerModel.find({}).exec();
  }

  async findByDate(date: string): Promise<Viewer> {
    return this.viewerModel.findOne({ date }).exec();
  }
}
