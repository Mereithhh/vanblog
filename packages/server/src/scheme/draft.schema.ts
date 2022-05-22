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

  @Prop()
  desc: string;

  @Prop({ default: false })
  deleted: boolean;
}

export const DraftSchema = SchemaFactory.createForClass(Draft);
