import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CustomType } from 'src/types/custom';

export type CustomPageDocument = CustomPage & Document;

@Schema()
export class CustomPage extends Document {
  @Prop({ index: true, unique: true })
  name: string;

  @Prop({ index: true, unique: true })
  path: string;

  @Prop({ index: true, default: 'file' })
  type: CustomType;

  @Prop()
  html: string;

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

export const CustomPageSchema = SchemaFactory.createForClass(CustomPage);
