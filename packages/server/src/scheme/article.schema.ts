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

  @Prop({ default: 0 })
  top: number;
  @Prop()
  category: string;

  @Prop({ default: false })
  hidden: boolean;

  @Prop({ default: false })
  private: boolean;

  @Prop({ default: '' })
  password: string;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ default: 0 })
  viewer: number;

  @Prop({ default: 0 })
  visited: number;

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
