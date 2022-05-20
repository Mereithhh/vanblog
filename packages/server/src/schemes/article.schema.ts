import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArticleDocument = Article & Document;

@Schema()
export class Article extends Document {
  @Prop()
  id: number;

  @Prop()
  title: string;

  @Prop()
  author: string;

  @Prop()
  content: string;

  @Prop()
  tags: string[];

  @Prop()
  categories: string[];

  @Prop()
  hiden: boolean;

  @Prop()
  private: boolean;

  @Prop()
  password: string;

  @Prop()
  desc: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
