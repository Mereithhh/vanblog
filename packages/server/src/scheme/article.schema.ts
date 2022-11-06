import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArticleDocument = Article & Document;

@Schema()
export class Article extends Document {
  @Prop({ index: true, unique: true })
  id: number;

  @Prop()
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

  @Prop()
  author: string;

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
    default: () => {
      return new Date();
    },
  })
  createdAt: Date;

  @Prop({
    default: () => {
      return new Date();
    },
  })
  updatedAt: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
