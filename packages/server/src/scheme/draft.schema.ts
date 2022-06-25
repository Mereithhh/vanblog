import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DraftDocument = Draft & Document;

@Schema()
export class Draft extends Document {
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
