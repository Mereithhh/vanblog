import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DraftDocument = Draft & Document;

@Schema()
export class Draft extends Document {
  @Prop({ index: true, unique: true })
  id: number;

  @Prop()
  title: string;

  @Prop({ default: '' })
  content: string;

  @Prop({ default: [], index: true })
  tags: string[];

  @Prop()
  author: string;

  @Prop({ index: true })
  category: string;

  @Prop({ default: false, index: true })
  deleted: boolean;

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

export const DraftSchema = SchemaFactory.createForClass(Draft);
