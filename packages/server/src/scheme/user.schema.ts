import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Permission } from 'src/types/access/access';
export type UserType = 'admin' | 'collaborator';
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

  @Prop()
  type: UserType;

  @Prop()
  nickname?: string;

  @Prop()
  permissions?: Permission[];
}

export const UserSchema = SchemaFactory.createForClass(User);
