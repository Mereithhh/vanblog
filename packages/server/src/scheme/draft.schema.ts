import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DraftDocument = Draft & Document;

@Schema()
export class Draft extends Document {
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
  desc: string;
}

export const DraftSchema = SchemaFactory.createForClass(Draft);
