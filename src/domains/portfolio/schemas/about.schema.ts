import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LOCALE_ENUM } from 'src/libs/types';

@Schema({ timestamps: true })
export class AboutGeneral extends Document {
  declare _id: Types.ObjectId;

  @Prop()
  image?: string;

  @Prop({
    type: {
      github: { type: String },
      linkedin: { type: String },
    },
  })
  socialLinks?: {
    github?: string;
    linkedin?: string;
  };
}

export const AboutGeneralSchema = SchemaFactory.createForClass(AboutGeneral);

@Schema({ timestamps: true })
export class AboutTranslation extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: String, enum: LOCALE_ENUM, required: true, unique: true })
  locale: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  bio: string;

  @Prop({ type: Types.ObjectId, ref: 'AboutGeneral', required: true })
  generalInfo: Types.ObjectId;
}

export const AboutTranslationSchema = SchemaFactory.createForClass(AboutTranslation);

export type About = {
  locale: string;
  fullName: string;
  role: string;
  bio: string;
  image?: string;
  socialLinks?: Record<string, string>;
};
