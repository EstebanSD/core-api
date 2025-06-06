import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { LOCALE_ENUM } from 'src/types';

export type SkillCategoryGeneralDocument = HydratedDocument<SkillCategoryGeneral>;
export type SkillCategoryTransDocument = HydratedDocument<SkillCategoryTrans>;
export type SkillItemDocument = HydratedDocument<SkillItem>;

export type SkillCategoryPlain = SkillCategoryGeneral;
export type SkillCategoryTransPlain = Omit<SkillCategoryTrans, 'general'> & {
  general: SkillCategoryPlain;
};
export type SkillItemPlain = Omit<SkillItem, 'category'> & {
  category: SkillCategoryPlain;
};

@Schema({ timestamps: true })
export class SkillCategoryGeneral {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ default: 0 })
  order: number;
}
export const SkillCategoryGeneralSchema = SchemaFactory.createForClass(SkillCategoryGeneral);

@Schema({ timestamps: true })
export class SkillCategoryTrans {
  @Prop({ type: String, enum: LOCALE_ENUM, required: true })
  locale: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'SkillCategoryGeneral', required: true })
  general: SkillCategoryGeneral;
}
export const SkillCategoryTransSchema = SchemaFactory.createForClass(SkillCategoryTrans);

@Schema({ timestamps: true })
export class SkillItem {
  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'SkillCategoryGeneral', required: true })
  category: SkillCategoryGeneral;

  @Prop()
  iconUrl?: string;
}
export const SkillItemSchema = SchemaFactory.createForClass(SkillItem);

SkillCategoryTransSchema.index({ general: 1, locale: 1 }, { unique: true });
SkillItemSchema.index({ name: 1, category: 1 }, { unique: true });
