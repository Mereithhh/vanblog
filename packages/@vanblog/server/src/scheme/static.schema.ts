import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { StaticType, StorageType } from 'src/types/setting.dto';

export type StaticDocument = Static & Document;

@Schema()
export class Static extends Document {
  @Prop({ default: 'img', index: true })
  staticType: StaticType;

  @Prop({ default: 'local', index: true })
  storageType: StorageType;

  @Prop({ index: true })
  // 文件类型，实际上是拓展名
  fileType: string;

  @Prop()
  // 实际 url 路径, oss 上的或者是 picGo 上的
  realPath: string;

  @Prop({ type: SchemaTypes.Mixed })
  // 元数据，暂时未定义。
  meta: any;

  @Prop({ index: true })
  // 实际路径 = type/name
  name: string;

  @Prop({ index: true })
  //签名;
  sign: string;

  @Prop({
    index: true,
    default: () => {
      return new Date();
    },
  })
  updatedAt: Date;
}

export const StaticSchema = SchemaFactory.createForClass(Static);
