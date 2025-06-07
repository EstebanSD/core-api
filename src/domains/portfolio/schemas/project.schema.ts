import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { PROJECT_STATUSES, PROJECT_TYPES, ProjectStatus, ProjectType } from 'src/types/portfolio';
import { LOCALE_ENUM, TECH_STACK, TechStack } from 'src/types';
import { Image } from 'src/common/schemas';

export type ProjectGeneralDocument = HydratedDocument<ProjectGeneral>;
export type ProjectTranslationDocument = HydratedDocument<ProjectTranslation>;

export type ProjectDocument = ProjectTranslationDocument & { general: ProjectGeneralDocument };
export type ProjectPlain = Omit<ProjectTranslation, 'general'> & {
  general: ProjectGeneral & { _id: string };
};

@Schema({ timestamps: true })
export class ProjectGeneral {
  @Prop({ required: true, enum: PROJECT_STATUSES })
  status: ProjectStatus;

  @Prop({ required: true, enum: PROJECT_TYPES })
  type: ProjectType;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop({ type: [String], enum: TECH_STACK })
  technologies?: TechStack[];

  @Prop({
    type: {
      github: { type: String },
      website: { type: String },
    },
    _id: false,
  })
  links?: {
    github?: string;
    website?: string;
  };

  @Prop({ type: [Image] })
  images?: Image[];
}

export const ProjectGeneralSchema = SchemaFactory.createForClass(ProjectGeneral);

@Schema({ timestamps: true })
export class ProjectTranslation {
  @Prop({ type: String, enum: LOCALE_ENUM, required: true })
  locale: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProjectGeneral', required: true })
  general: mongoose.Types.ObjectId;
}

export const ProjectTranslationSchema = SchemaFactory.createForClass(ProjectTranslation);

ProjectTranslationSchema.index({ title: 1, locale: 1 }, { unique: true }); // Ensure unique title per locale
