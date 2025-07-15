import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ROLES_ENUM, RolesType } from 'src/auth/types';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  fullName?: string;

  @Prop({ type: String, enum: ROLES_ENUM, default: 'User' })
  role: RolesType;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
