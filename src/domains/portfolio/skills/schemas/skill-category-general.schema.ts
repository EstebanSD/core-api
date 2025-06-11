import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SkillCategoryGeneralDocument = HydratedDocument<SkillCategoryGeneral>;
export type SkillCategoryPlain = SkillCategoryGeneral;

@Schema({ timestamps: true })
export class SkillCategoryGeneral {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ default: 0 })
  order: number;
}
export const SkillCategoryGeneralSchema = SchemaFactory.createForClass(SkillCategoryGeneral);
