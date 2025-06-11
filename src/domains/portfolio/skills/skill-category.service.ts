import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectPortfolioModel } from 'src/common/helpers';
import {
  SkillCategoryGeneral,
  SkillCategoryGeneralDocument,
  SkillCategoryPlain,
  SkillCategoryTrans,
  SkillCategoryTransDocument,
  SkillCategoryTransPlain,
  SkillItem,
  SkillItemDocument,
} from './schemas';
import {
  AddSkillTranslationDto,
  CreateSkillCategoryDto,
  FilterCategoryDto,
  UpdateSkillCategoryDto,
  UpdateSkillTransDto,
} from './dtos';

@Injectable()
export class SkillCategoryService {
  constructor(
    @InjectPortfolioModel(SkillCategoryGeneral.name)
    private readonly categoryGeneralModel: Model<SkillCategoryGeneralDocument>,
    @InjectPortfolioModel(SkillCategoryTrans.name)
    private readonly categoryTransModel: Model<SkillCategoryTransDocument>,
    @InjectPortfolioModel(SkillItem.name)
    private readonly itemModel: Model<SkillItemDocument>,
  ) {}

  async createCategoryGeneral(body: CreateSkillCategoryDto): Promise<SkillCategoryPlain> {
    const existing = await this.categoryGeneralModel.findOne({ key: body.key }).lean().exec();

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
    const general = await this.categoryGeneralModel.findById(generalId).lean().exec();
    if (!general) {
      throw new NotFoundException(`Category general with id "${generalId}" not found`);
    }

    const existing = await this.categoryTransModel
      .findOne({
        general: generalId,
        locale: body.locale,
      })
      .exec();

    if (existing) {
      throw new ConflictException(`Translation for locale "${body.locale}" already exists`);
    }

    const created = new this.categoryTransModel({
      ...body,
      general: general._id,
    });

    const translation = await created.save();
    return { ...translation.toObject(), general };
  }

  async updateCategoryOrder(
    categoryId: string,
    { order }: UpdateSkillCategoryDto,
  ): Promise<SkillCategoryPlain> {
    const category = await this.categoryGeneralModel.findById(categoryId).exec();

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
    const translation = await this.categoryTransModel
      .findOne({
        general: categoryId,
        locale,
      })
      .populate<{ general: SkillCategoryGeneralDocument }>('general')
      .exec();

    if (!translation) {
      throw new NotFoundException(
        `Translation for category "${categoryId}" in locale "${locale}" not found`,
      );
    }

    translation.name = name;

    const updated = await translation.save();
    return updated.toObject();
  }

  async findAllCategories(
    locale: string,
    filter: FilterCategoryDto,
  ): Promise<SkillCategoryTransPlain[]> {
    const sortOrder = filter.order === 'desc' ? -1 : 1;

    const categories = await this.categoryGeneralModel.find().sort({ order: sortOrder }).exec();

    const results = await Promise.all(
      categories.map(async (category) => {
        const translation = await this.categoryTransModel
          .findOne({
            general: category._id,
            locale,
          })
          .exec();

        if (!translation) return null;

        if (filter.name && !translation.name.toLowerCase().includes(filter.name.toLowerCase())) {
          return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { general, ...rest } = translation.toObject();

        return {
          ...rest,
          general: category.toObject(),
        } as SkillCategoryTransPlain;
      }),
    );

    return results.filter((r): r is SkillCategoryTransPlain => r !== null);
  }

  async findCategoryById(
    categoryId: string,
    locale: string,
  ): Promise<SkillCategoryTransPlain | null> {
    const category = await this.categoryGeneralModel.findById(categoryId).exec();
    if (!category) {
      throw new NotFoundException(`Category with id "${categoryId}" not found`);
    }

    const translation = await this.categoryTransModel
      .findOne({
        general: categoryId,
        locale,
      })
      .exec();

    if (!translation) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { general, ...rest } = translation.toObject();

    return {
      ...rest,
      general: category.toObject(),
    } as SkillCategoryTransPlain;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const category = await this.categoryGeneralModel.findById(categoryId).exec();
    if (!category) {
      throw new NotFoundException(`Category with id "${categoryId}" not found`);
    }

    const hasItems = await this.itemModel.exists({ category: categoryId });
    if (hasItems) {
      throw new BadRequestException(`Cannot delete category with existing skill items`);
    }

    await this.categoryTransModel.deleteMany({ general: categoryId }).exec();

    await this.categoryGeneralModel.findByIdAndDelete(categoryId).exec();
  }

  async deleteCategoryTranslation(
    categoryId: string,
    locale: string,
  ): Promise<{ categoryGeneralDeleted: boolean }> {
    const translation = await this.categoryTransModel
      .findOne({
        general: categoryId,
        locale,
      })
      .lean()
      .exec();

    if (!translation) {
      throw new NotFoundException(
        `Translation for category "${categoryId}" in locale "${locale}" not found`,
      );
    }

    const translationsCount = await this.categoryTransModel.countDocuments({
      general: categoryId,
    });

    const hasItems = await this.itemModel.exists({ category: categoryId });

    if (translationsCount <= 1) {
      if (hasItems) {
        throw new BadRequestException(
          `Cannot delete the last translation of a category with existing skill items`,
        );
      }

      await this.categoryTransModel.deleteOne({ _id: translation._id }).exec();
      await this.categoryGeneralModel.findByIdAndDelete(categoryId).exec();

      return { categoryGeneralDeleted: true };
    }

    await this.categoryTransModel.deleteOne({ _id: translation._id }).exec();

    return { categoryGeneralDeleted: false };
  }
}
