import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Image } from 'src/common/schemas';
import { LOCALE_ENUM } from 'src/types';

export type AboutGeneralDocument = HydratedDocument<AboutGeneral>;
export type AboutTranslationDocument = HydratedDocument<AboutTranslation>;

export type AboutDocument = AboutTranslationDocument & { generalInfo: AboutGeneralDocument };
export type AboutPlain = Omit<AboutTranslation, 'generalInfo'> & { generalInfo: AboutGeneral };

@Schema({ timestamps: true })
export class AboutGeneral {
  @Prop({ type: Image })
  image?: Image;

  @Prop({
    type: {
      github: { type: String },
      linkedin: { type: String },
    },
    _id: false,
  })
  socialLinks?: {
    github?: string;
    linkedin?: string;
  };
}

export const AboutGeneralSchema = SchemaFactory.createForClass(AboutGeneral);

@Schema({ timestamps: true })
export class AboutTranslation {
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
