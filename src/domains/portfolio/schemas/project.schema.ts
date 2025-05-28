import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema()
export class Project {
  @Prop({ required: true, unique: true }) // Unique for retryWrites
  title: string;

  @Prop()
  description: string;

  @Prop()
  link: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
