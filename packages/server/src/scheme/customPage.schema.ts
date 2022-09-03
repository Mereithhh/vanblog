import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomPageDocument = CustomPage & Document;

@Schema()
export class CustomPage extends Document {
  @Prop()
  name: string;

  @Prop()
  path: string;

  @Prop()
  html: string;

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

export const CustomPageSchema = SchemaFactory.createForClass(CustomPage);
