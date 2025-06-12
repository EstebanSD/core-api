import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SocialPlatformType } from 'src/types';

export type ContactDocument = HydratedDocument<Contact>;

export type SocialLinks = Partial<Record<SocialPlatformType, string>>;

@Schema({ timestamps: true })
export class Contact {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({ type: Object })
  socialLinks?: SocialLinks;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
