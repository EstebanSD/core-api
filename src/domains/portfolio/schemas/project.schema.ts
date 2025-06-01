import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PROJECT_STATUSES, PROJECT_TYPES, ProjectStatus, ProjectType } from 'src/types/portfolio';
import { TECH_STACK, TechStack } from 'src/types';

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  locale: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

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
  })
  links?: {
    github?: string;
    website?: string;
  };

  @Prop([String])
  images?: string[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ title: 1, locale: 1 }, { unique: true }); // Ensure unique title per locale

// ProjectSchema.index({ locale: 1 }); // maybe

export type ProjectDocument = HydratedDocument<Project>;
