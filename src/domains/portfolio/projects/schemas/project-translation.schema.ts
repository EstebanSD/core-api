import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { LOCALE_ENUM } from 'src/types';
import { ProjectGeneral } from './project-general.schema';

export type ProjectTranslationDocument = HydratedDocument<ProjectTranslation>;

export type ProjectPlain = Omit<ProjectTranslation, 'general'> & {
  general: ProjectGeneral;
};

@Schema({ timestamps: true })
export class ProjectTranslation {
  @Prop({ type: String, enum: LOCALE_ENUM, required: true })
  locale: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'ProjectGeneral', required: true })
  general: Types.ObjectId;
}

export const ProjectTranslationSchema = SchemaFactory.createForClass(ProjectTranslation);

ProjectTranslationSchema.index({ general: 1, locale: 1 }, { unique: true }); // Ensure unique title per locale
