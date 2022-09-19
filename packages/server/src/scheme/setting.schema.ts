import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { SettingType, SettingValue } from 'src/types/setting.dto';

export type SettingDocument = Setting & Document;

@Schema()
export class Setting extends Document {
  @Prop({ default: 'static', index: true, unique: true })
  type: SettingType;

  @Prop({ type: SchemaTypes.Mixed })
  value: SettingValue;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
