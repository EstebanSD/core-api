import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { LocaleType } from 'src/types';
import { ExperienceGeneral } from './experience-general.schema';

export type ExperienceTranslationDocument = HydratedDocument<ExperienceTranslation>;
export type ExperiencePlain = Omit<ExperienceTranslation, 'general'> & {
  general: ExperienceGeneral;
};

@Schema({ timestamps: true })
export class ExperienceTranslation {
  @Prop({ required: true })
  locale: LocaleType;

  @Prop({ required: true })
  position: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'ExperienceGeneral', required: true })
  general: Types.ObjectId;
}

export const ExperienceTranslationSchema = SchemaFactory.createForClass(ExperienceTranslation);

ExperienceTranslationSchema.index({ general: 1, locale: 1 }, { unique: true });
