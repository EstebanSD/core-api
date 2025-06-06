import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SkillCategoryGeneral,
  SkillCategoryGeneralDocument,
  SkillCategoryPlain,
  SkillCategoryTrans,
  SkillCategoryTransDocument,
  SkillCategoryTransPlain,
} from '../schemas/skill.schema';
import {
  AddSkillTranslationDto,
  CreateSkillCategoryDto,
  UpdateSkillCategoryDto,
  UpdateSkillTransDto,
} from './dtos';

@Injectable()
export class SkillCategoryService {
  constructor(
    @InjectModel(SkillCategoryGeneral.name)
    private readonly categoryGeneralModel: Model<SkillCategoryGeneralDocument>,
    @InjectModel(SkillCategoryTrans.name)
    private readonly categoryTransModel: Model<SkillCategoryTransDocument>,
  ) {}

  async createCategoryGeneral(body: CreateSkillCategoryDto): Promise<SkillCategoryPlain> {
    const existing = await this.categoryGeneralModel.findOne({ key: body.key });

    if (existing) {
      throw new ConflictException(`Skill category with key "${body.key}" already exists`);
    }

    const created = new this.categoryGeneralModel(body);

    const category = await created.save();
    return category.toObject();
  }

  async addCategoryTranslation(
    generalId: string,
    body: AddSkillTranslationDto,
  ): Promise<SkillCategoryTransPlain> {
    const general = await this.categoryGeneralModel.findById(generalId);
    if (!general) {
      throw new NotFoundException(`Category general with id "${generalId}" not found`);
    }

    const existing = await this.categoryTransModel.findOne({
      general: generalId,
      locale: body.locale,
    });

    if (existing) {
      throw new ConflictException(`Translation for locale "${body.locale}" already exists`);
    }

    const created = new this.categoryTransModel({
      ...body,
      general: general._id,
    });

    const translation = await created.save();
    return translation.toObject();
  }

  async updateCategoryOrder(
    categoryId: string,
    { order }: UpdateSkillCategoryDto,
  ): Promise<SkillCategoryPlain> {
    const category = await this.categoryGeneralModel.findById(categoryId);

    if (!category) {
      throw new NotFoundException(`Category with id "${categoryId}" not found`);
    }

    category.order = order;

    const updated = await category.save();
    return updated.toObject();
  }

  async updateCategoryTranslation(
    categoryId: string,
    locale: string,
    { name }: UpdateSkillTransDto,
  ): Promise<SkillCategoryTransPlain> {
    const translation = await this.categoryTransModel.findOne({
      general: categoryId,
      locale,
    });

    if (!translation) {
      throw new NotFoundException(
        `Translation for category "${categoryId}" in locale "${locale}" not found`,
      );
    }

    translation.name = name;

    const updated = await translation.save();
    return updated.toObject();
  }
}
