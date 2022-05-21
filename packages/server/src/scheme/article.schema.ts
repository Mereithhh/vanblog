import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArticleDocument = Article & Document;

@Schema()
export class Article extends Document {
  @Prop()
  id: number;

  @Prop()
  title: string;

  @Prop({ default: '' })
  content: string;

  @Prop({ default: [] })
  tags: string[];

  @Prop()
  category: string;

  @Prop({ default: false })
  hiden: boolean;

  @Prop({ default: false })
  private: boolean;

  @Prop({ default: '' })
  password: string;

  @Prop()
  desc: string;

  @Prop({ defualt: false })
  deleted: boolean;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
