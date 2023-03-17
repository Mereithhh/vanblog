import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type TokenDocument = Token & Document;

@Schema()
export class Token extends Document {
  @Prop({ index: true })
  userId: number;

  @Prop({ index: true })
  token: string;

  @Prop({ index: true })
  name?: string;

  @Prop()
  expiresIn: number;

  @Prop({
    index: true,
    default: () => {
      return new Date();
    },
  })
  createdAt: Date;

  @Prop({ default: false, index: true })
  disabled: boolean;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
