import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { FileMetadataSchema } from 'src/common/schemas';
import { FileMetadata } from 'src/types/interfaces';
import { EXPERIENCE_TYPE_ENUM, ExperienceType } from 'src/types/portfolio';

export type ExperienceGeneralDocument = HydratedDocument<ExperienceGeneral>;
export type ExperienceGeneralPlain = ExperienceGeneral;

@Schema({ timestamps: true })
export class ExperienceGeneral {
  @Prop({ required: true, unique: true })
  companyName: string;

  @Prop({ type: FileMetadataSchema })
  companyLogo?: FileMetadata;

  @Prop({ required: true, enum: EXPERIENCE_TYPE_ENUM })
  type: ExperienceType;

  @Prop()
  location?: string;

  @Prop({ type: [String] })
  technologies?: string[];

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate?: Date;

  @Prop({ default: false })
  ongoing?: boolean;
}

export const ExperienceGeneralSchema = SchemaFactory.createForClass(ExperienceGeneral);
