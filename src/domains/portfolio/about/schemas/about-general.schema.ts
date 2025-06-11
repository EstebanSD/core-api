import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { FileMetadataSchema } from 'src/common/schemas';
import { FileMetadata } from 'src/types/interfaces';

export type AboutGeneralDocument = HydratedDocument<AboutGeneral>;

@Schema({ timestamps: true })
export class AboutGeneral {
  @Prop({ required: true })
  fullName: string;

  @Prop({ type: Number })
  birthYear?: number;

  @Prop()
  location?: string;

  @Prop({ type: FileMetadataSchema })
  image?: FileMetadata;

  @Prop({ type: [String] })
  positioningTags?: string[];
}

export const AboutGeneralSchema = SchemaFactory.createForClass(AboutGeneral);
