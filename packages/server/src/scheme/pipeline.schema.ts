import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { VanblogEventType } from 'src/types/event';
export type PipelineDocument = Pipeline & Document;

@Schema()
export class Pipeline extends Document {
  @Prop({ index: true, unique: true })
  id: number;

  @Prop({ index: true })
  name: string;

  @Prop({ index: true })
  eventType: VanblogEventType;

  @Prop({ index: true })
  description: string;

  @Prop({ default: false })
  enabled: boolean;

  @Prop({ default: [] })
  deps: string[];

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

  @Prop({ index: true })
  eventName: string;

  @Prop()
  script: string;

  @Prop({ default: false, index: true })
  deleted: boolean;
}

export const PipelineSchema = SchemaFactory.createForClass(Pipeline);
