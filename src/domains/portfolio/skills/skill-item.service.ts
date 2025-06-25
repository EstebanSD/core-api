import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectPortfolioModel } from 'src/common/helpers';
import {
  SkillCategoryGeneral,
  SkillCategoryGeneralDocument,
  SkillItem,
  SkillItemDocument,
  SkillItemPlain,
} from './schemas';
import { IStorageService } from 'src/libs/storage';
import { SanitizerService } from 'src/libs/sanitizer';
import { CreateSkillItemDto, FilterItemDto, UpdateSkillItemDto } from './dtos';

@Injectable()
export class SkillItemService {
  constructor(
    @InjectPortfolioModel(SkillCategoryGeneral.name)
    private readonly categoryGeneralModel: Model<SkillCategoryGeneralDocument>,
    @InjectPortfolioModel(SkillItem.name)
    private readonly itemModel: Model<SkillItemDocument>,
    @Inject('IStorageService') private readonly storageService: IStorageService,
    private readonly sanitizerService: SanitizerService,
  ) {}

  async createItem(
    categoryId: string,
    body: CreateSkillItemDto,
    file?: Express.Multer.File,
  ): Promise<SkillItemPlain> {
    const category = await this.categoryGeneralModel.findById(categoryId).lean().exec();
    if (!category) {
      throw new NotFoundException(`Category with id "${categoryId}" not found`);
    }

    let icon: { publicId: string; url: string } | null = null;
    if (file) {
      let fileBuffer = file.buffer;

      // If the file is an SVG, sanitize it
      if (file.mimetype === 'image/svg+xml') {
        const rawSvg = file.buffer.toString('utf-8');
        const cleanSvg = this.sanitizerService.sanitizeSvg(rawSvg);
        fileBuffer = Buffer.from(cleanSvg, 'utf-8');
      }

      const { publicId, url } = await this.storageService.uploadFile({
        fileBuffer,
        filename: file.originalname,
        mimetype: file.mimetype,
        folder: 'portfolio/skills',
      });

      icon = { publicId, url };
    }
    const created = new this.itemModel({
      name: body.name,
      category: category._id,
      icon,
    });

    const item = await created.save();
    return { ...item.toObject(), category };
  }

  async updateItem(
    itemId: string,
    { name }: UpdateSkillItemDto,
    file?: Express.Multer.File,
  ): Promise<SkillItemPlain> {
    const item = await this.itemModel
      .findById<SkillItemDocument>(itemId)
      .populate<{ category: SkillCategoryGeneralDocument }>('category')
      .exec();
    if (!item) {
      throw new NotFoundException(`Skill item with id "${itemId}" not found`);
    }

    Object.assign(item, {
      ...(name && { name }),
    });

    if (file) {
      let fileBuffer = file.buffer;

      // If the file is an SVG, sanitize it
      if (file.mimetype === 'image/svg+xml') {
        const rawSvg = file.buffer.toString('utf-8');
        const cleanSvg = this.sanitizerService.sanitizeSvg(rawSvg);
        fileBuffer = Buffer.from(cleanSvg, 'utf-8');
      }

      if (item.icon?.publicId) {
        await this.storageService.deleteFile(item.icon.publicId);
      }

      const { publicId, url } = await this.storageService.uploadFile({
        fileBuffer,
        filename: file.originalname,
        mimetype: file.mimetype,
        folder: 'portfolio/skills',
      });

      item.icon = { publicId, url };
    }

    const updated = await item.save();
    return updated.toObject();
  }

  async findItemsByCategory(categoryId: string, filter: FilterItemDto): Promise<SkillItemPlain[]> {
    const generalObjectId = new Types.ObjectId(categoryId);
    const query: Record<string, any> = { category: generalObjectId };

    if (filter.name) {
      query.name = { $regex: filter.name, $options: 'i' };
    }

    const items = await this.itemModel
      .find(query)
      .sort({ name: 1 })
      .populate<{ category: SkillCategoryGeneralDocument }>('category')
      .exec();

    return items.map((item) => item.toObject());
  }

  async deleteItem(itemId: string): Promise<void> {
    const item = await this.itemModel.findById(itemId).exec();
    if (!item) {
      throw new NotFoundException(`Skill item with id "${itemId}" not found`);
    }

    if (item.icon?.publicId) {
      await this.storageService.deleteFile(item.icon.publicId);
    }

    await this.itemModel.deleteOne({ _id: itemId }).exec();
  }
}
