import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { StaticType, StorageType } from 'src/types/setting.dto';

export type StaticDocument = Static & Document;

@Schema()
export class Static extends Document {
  @Prop({ default: 'img' })
  staticType: StaticType;

  @Prop({ default: 'local' })
  storageType: StorageType;

  @Prop()
  // 文件类型，实际上是拓展名
  fileType: string;

  @Prop()
  // 实际 url 路径, oss 上的或者是 picGo 上的
  realPath: string;

  @Prop({ type: SchemaTypes.Mixed })
  // 元数据，暂时未定义。
  meta: any;

  @Prop()
  // 实际路径 = type/name
  name: string;

  @Prop()
  //签名;
  sign: string;

  @Prop({
    default: () => {
      return new Date();
    },
  })
  updatedAt: Date;
}

export const StaticSchema = SchemaFactory.createForClass(Static);
