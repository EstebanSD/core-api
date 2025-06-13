import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PROJECT_STATUSES, PROJECT_TYPES, ProjectStatus, ProjectType } from 'src/types/portfolio';
import { FileMetadataSchema } from 'src/common/schemas';
import { FileMetadata } from 'src/types/interfaces';

export type ProjectGeneralDocument = HydratedDocument<ProjectGeneral>;
export type ProjectGeneralPlain = ProjectGeneral;

@Schema({ timestamps: true })
export class ProjectGeneral {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ required: true, enum: PROJECT_TYPES })
  type: ProjectType;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop({ required: true, enum: PROJECT_STATUSES })
  status: ProjectStatus;

  @Prop({ type: [String] })
  technologies?: string[];

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

  @Prop({ type: [FileMetadataSchema] })
  images?: FileMetadata[];
}

export const ProjectGeneralSchema = SchemaFactory.createForClass(ProjectGeneral);
