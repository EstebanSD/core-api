import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FileMetadataSchema } from 'src/common/schemas';
import { FileMetadata } from 'src/types/interfaces';
import { SkillCategoryPlain } from './skill-category-general.schema';

export type SkillItemDocument = HydratedDocument<SkillItem>;
export type SkillItemPlain = Omit<SkillItem, 'category'> & {
  category: SkillCategoryPlain;
};

@Schema({ timestamps: true })
export class SkillItem {
  @Prop({ required: true })
  name: string;

  @Prop({ type: FileMetadataSchema })
  icon?: FileMetadata;

  @Prop({ type: Types.ObjectId, ref: 'SkillCategoryGeneral', required: true })
  category: Types.ObjectId;
}
export const SkillItemSchema = SchemaFactory.createForClass(SkillItem);

SkillItemSchema.index({ name: 1, category: 1 }, { unique: true });
