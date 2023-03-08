import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArticleDocument = Article & Document;

@Schema()
export class Article extends Document {
  @Prop({ index: true, unique: true })
  id: number;

  @Prop({ index: true })
  title: string;

  @Prop({ default: '' })
  content: string;

  @Prop({ default: [], index: true })
  tags: string[];

  @Prop({ default: 0, index: true })
  top: number;

  @Prop({ index: true })
  category: string;

  @Prop({ default: false, index: true })
  hidden: boolean;

  @Prop({ index: true })
  author: string;

  @Prop({ default: '', index: true })
  pathname: string;

  @Prop({ default: false, index: true })
  private: boolean;

  @Prop({ default: '' })
  password: string;

  @Prop({ default: false, index: true })
  deleted: boolean;

  @Prop({ default: 0 })
  viewer: number;

  @Prop({ default: 0 })
  visited: number;

  @Prop()
  copyright?: string;

  @Prop()
  lastVisitedTime: Date;

  @Prop({
    index: true,
    default: () => {
      return new Date();
    },
  })
  createdAt: Date;

  @Prop({
    index: true,
    default: () => {
      return new Date();
    },
  })
  updatedAt: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
