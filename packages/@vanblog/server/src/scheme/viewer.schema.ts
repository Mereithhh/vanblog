import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ViewerDocument = Viewer & Document;

@Schema()
export class Viewer extends Document {
  @Prop()
  visited: number;

  @Prop()
  viewer: number;

  @Prop({ index: true })
  date: string;

  @Prop({
    index: true,
    default: () => {
      return new Date();
    },
  })
  createdAt: Date;
}

export const ViewerSchema = SchemaFactory.createForClass(Viewer);
