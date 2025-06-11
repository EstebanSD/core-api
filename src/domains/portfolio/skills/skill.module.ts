import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SkillCategoryGeneral,
  SkillCategoryGeneralSchema,
  SkillCategoryTrans,
  SkillCategoryTransSchema,
  SkillItem,
  SkillItemSchema,
} from './schemas';
import { StorageModule } from 'src/libs/storage';
import { SkillController } from './skill.controller';
import { SkillCategoryService } from './skill-category.service';
import { SkillItemService } from './skill-item.service';
import { SanitizerModule } from 'src/libs/sanitizer';
import { DB_CONNECTIONS } from 'src/common/constants';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: SkillCategoryGeneral.name, schema: SkillCategoryGeneralSchema },
        { name: SkillCategoryTrans.name, schema: SkillCategoryTransSchema },
        { name: SkillItem.name, schema: SkillItemSchema },
      ],
      DB_CONNECTIONS.PORTFOLIO,
    ),
    StorageModule.registerAsync(),
    SanitizerModule,
  ],
  controllers: [SkillController],
  providers: [SkillCategoryService, SkillItemService],
})
export class SkillModule {}
