import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SkillCategoryGeneral,
  SkillCategoryGeneralDocument,
  SkillItem,
  SkillItemDocument,
  SkillItemPlain,
} from '../schemas/skill.schema';
import { IStorageService } from 'src/libs/storage';
import { SanitizerService } from 'src/libs/sanitizer';
import { CreateSkillItemDto, FilterItemDto, UpdateSkillItemDto } from './dtos';

@Injectable()
export class SkillItemService {
  constructor(
    @InjectModel(SkillCategoryGeneral.name)
    private readonly categoryGeneralModel: Model<SkillCategoryGeneralDocument>,
    @InjectModel(SkillItem.name)
    private readonly itemModel: Model<SkillItemDocument>,
    @Inject('IStorageService') private readonly storageService: IStorageService,
    private readonly sanitizerService: SanitizerService,
  ) {}
  async createItem(
    categoryId: string,
    body: CreateSkillItemDto,
    file?: Express.Multer.File,
  ): Promise<SkillItemPlain> {
    const category = await this.categoryGeneralModel.findById(categoryId).exec();
    if (!category) {
      throw new NotFoundException(`Category with id "${categoryId}" not found`);
    }

    let iconUrl: { publicId: string; url: string } | null = null;
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

      iconUrl = { publicId, url };
    }
    const created = new this.itemModel({
      name: body.name,
      category: category._id,
      iconUrl,
    });

    const item = await created.save();
    return item.toObject();
  }

  async updateItem(
    { name }: UpdateSkillItemDto,
    itemId: string,
    file?: Express.Multer.File,
  ): Promise<SkillItemPlain> {
    const item = await this.itemModel.findById<SkillItemDocument>(itemId).exec();
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

      if (item.iconUrl?.publicId) {
        await this.storageService.deleteFile(item.iconUrl.publicId);
      }

      const { publicId, url } = await this.storageService.uploadFile({
        fileBuffer,
        filename: file.originalname,
        mimetype: file.mimetype,
        folder: 'portfolio/skills',
      });

      item.iconUrl = { publicId, url };
    }

    const updated = await item.save();
    return updated.toObject();
  }

  async findItemsByCategory(categoryId: string, filter: FilterItemDto): Promise<SkillItemPlain[]> {
    const query: Record<string, any> = { category: categoryId };

    if (filter.name) {
      query.name = { $regex: filter.name, $options: 'i' };
    }

    const items = await this.itemModel.find(query).sort({ name: 1 }).exec();

    return items.map((item) => item.toObject());
  }

  async deleteItem(itemId: string): Promise<void> {
    const item = await this.itemModel.findById(itemId).exec();
    if (!item) {
      throw new NotFoundException(`Skill item with id "${itemId}" not found`);
    }

    if (item.iconUrl?.publicId) {
      await this.storageService.deleteFile(item.iconUrl.publicId);
    }

    await this.itemModel.deleteOne({ _id: itemId }).exec();
  }
}
