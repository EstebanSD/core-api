import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SkillCategoryGeneral,
  SkillCategoryGeneralSchema,
  SkillCategoryTrans,
  SkillCategoryTransSchema,
  SkillItem,
  SkillItemSchema,
} from '../schemas/skill.schema';
import { StorageModule } from 'src/libs/storage';
import { SkillController } from './skill.controller';
import { SkillCategoryService } from './skill-category.service';
import { SkillItemService } from './skill-item.service';
import { SanitizerModule } from 'src/libs/sanitizer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SkillCategoryGeneral.name, schema: SkillCategoryGeneralSchema },
      { name: SkillCategoryTrans.name, schema: SkillCategoryTransSchema },
      { name: SkillItem.name, schema: SkillItemSchema },
    ]),
    StorageModule.registerAsync(),
    SanitizerModule,
  ],
  controllers: [SkillController],
  providers: [SkillCategoryService, SkillItemService],
})
export class SkillModule {}
