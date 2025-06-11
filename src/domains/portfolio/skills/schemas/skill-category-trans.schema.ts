import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { LOCALE_ENUM } from 'src/types';
import { SkillCategoryPlain } from './skill-category-general.schema';

export type SkillCategoryTransDocument = HydratedDocument<SkillCategoryTrans>;

export type SkillCategoryTransPlain = Omit<SkillCategoryTrans, 'general'> & {
  general: SkillCategoryPlain;
};

@Schema({ timestamps: true })
export class SkillCategoryTrans {
  @Prop({ type: String, enum: LOCALE_ENUM, required: true })
  locale: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'SkillCategoryGeneral', required: true })
  general: Types.ObjectId;
}
export const SkillCategoryTransSchema = SchemaFactory.createForClass(SkillCategoryTrans);

SkillCategoryTransSchema.index({ general: 1, locale: 1 }, { unique: true });
