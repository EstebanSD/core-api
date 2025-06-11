import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { SkillCategoryService } from './skill-category.service';
import { SkillItemService } from './skill-item.service';
import {
  AddSkillTranslationDto,
  CreateSkillCategoryDto,
  CreateSkillItemDto,
  FilterCategoryDto,
  FilterItemDto,
  UpdateSkillCategoryDto,
  UpdateSkillItemDto,
  UpdateSkillTransDto,
} from './dtos';
import { LocaleType } from 'src/types';
import { Auth, ImageUploadInterceptor, Roles } from 'src/common/decorators';

@Controller('portfolio/skills')
export class SkillController {
  constructor(
    private readonly skillCategoryService: SkillCategoryService,
    private readonly skillItemService: SkillItemService,
  ) {}

  @Get('categories/:locale')
  findAllCategories(@Param('locale') locale: LocaleType, @Query() query: FilterCategoryDto) {
    return this.skillCategoryService.findAllCategories(locale, query);
  }

  @Get('categories/:generalId/locale/:locale')
  findCategoryById(@Param('generalId') generalId: string, @Param('locale') locale: LocaleType) {
    return this.skillCategoryService.findCategoryById(generalId, locale);
  }

  @Auth()
  @Roles('Admin')
  @Post('categories')
  createCategoryGeneral(@Body() body: CreateSkillCategoryDto) {
    return this.skillCategoryService.createCategoryGeneral(body);
  }

  @Auth()
  @Roles('Admin')
  @Post('categories/:generalId/locale')
  createCategory(@Param('generalId') generalId: string, @Body() body: AddSkillTranslationDto) {
    return this.skillCategoryService.addCategoryTranslation(generalId, body);
  }

  @Auth()
  @Roles('Admin')
  @Patch('categories/:generalId')
  updateCategoryOrder(@Param('generalId') generalId: string, @Body() body: UpdateSkillCategoryDto) {
    return this.skillCategoryService.updateCategoryOrder(generalId, body);
  }

  @Auth()
  @Roles('Admin')
  @Patch('categories/:generalId/locale/:locale')
  updateCategoryTranslation(
    @Param('generalId') generalId: string,
    @Param('locale') locale: LocaleType,
    @Body() body: UpdateSkillTransDto,
  ) {
    return this.skillCategoryService.updateCategoryTranslation(generalId, locale, body);
  }

  @Auth()
  @Roles('Admin')
  @Delete('categories/:generalId')
  deleteCategory(@Param('generalId') generalId: string) {
    return this.skillCategoryService.deleteCategory(generalId);
  }

  @Auth()
  @Roles('Admin')
  @Delete('categories/:generalId/locale/:locale')
  deleteCategoryTranslation(
    @Param('generalId') generalId: string,
    @Param('locale') locale: LocaleType,
  ) {
    return this.skillCategoryService.deleteCategoryTranslation(generalId, locale);
  }

  //// ITEMS ////

  @Get('categories/:generalId/items')
  findItemsByCategory(@Param('generalId') generalId: string, @Query() query: FilterItemDto) {
    return this.skillItemService.findItemsByCategory(generalId, query);
  }

  @Auth()
  @Roles('Admin')
  @Post('categories/:generalId/items')
  @ImageUploadInterceptor()
  createItem(
    @Param('generalId') generalId: string,
    @Body() body: CreateSkillItemDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.skillItemService.createItem(generalId, body, file);
  }

  @Auth()
  @Roles('Admin')
  @Patch('items/:itemId')
  @ImageUploadInterceptor()
  updateItem(
    @Param('itemId') itemId: string,
    @Body() body: UpdateSkillItemDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.skillItemService.updateItem(itemId, body, file);
  }

  @Auth()
  @Roles('Admin')
  @Delete('items/:itemId')
  deleteItem(@Param('itemId') itemId: string) {
    return this.skillItemService.deleteItem(itemId);
  }
}
