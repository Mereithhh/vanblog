import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User extends Document {
  @Prop()
  id: number;

  @Prop()
  name: string;

  @Prop()
  password: string;

  @Prop({
    default: () => {
      return new Date();
    },
  })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
