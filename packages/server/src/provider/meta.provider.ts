import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meta, MetaDocument } from 'src/scheme/meta.schema';

@Injectable()
export class MetaProvider {
  constructor(@InjectModel('Meta') private metaModel: Model<MetaDocument>) {}

  async getAll(): Promise<Meta> {
    return this.metaModel.findOne().exec();
  }
}
