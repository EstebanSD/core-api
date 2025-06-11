import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FileMetadataSchema } from 'src/common/schemas';
import { LOCALE_ENUM } from 'src/types';
import { FileMetadata } from 'src/types/interfaces';
import { AboutGeneral, AboutGeneralDocument } from './about-general.schema';

export type AboutTranslationDocument = HydratedDocument<AboutTranslation>;

export type AboutDocument = AboutTranslationDocument & { general: AboutGeneralDocument };
export type AboutPlain = Omit<AboutTranslation, 'general'> & { general: AboutGeneral };

@Schema({ timestamps: true })
export class AboutTranslation {
  @Prop({ type: String, enum: LOCALE_ENUM, required: true, unique: true })
  locale: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  bio: string;

  @Prop()
  tagline?: string;

  @Prop({ type: FileMetadataSchema })
  cv?: FileMetadata;

  @Prop({ type: Types.ObjectId, ref: 'AboutGeneral', required: true })
  general: Types.ObjectId;
}

export const AboutTranslationSchema = SchemaFactory.createForClass(AboutTranslation);
