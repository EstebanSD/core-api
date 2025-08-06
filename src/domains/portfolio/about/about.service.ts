import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectPortfolioModel, pickDefined } from 'src/common/helpers';
import {
  AboutPlain,
  AboutGeneral,
  AboutGeneralDocument,
  AboutTranslation,
  AboutTranslationDocument,
} from './schemas';
import {
  AddTranslationAboutDto,
  CreateGeneralAboutDto,
  UpdateAboutDto,
  UpdateGeneralAboutDto,
  UpdateTranslationAboutDto,
} from './dtos';
import { IStorageService } from 'src/libs/storage';
import { LocaleType } from 'src/types';
import { FileMetadata } from 'src/types/interfaces';

@Injectable()
export class AboutService {
  constructor(
    @InjectPortfolioModel(AboutGeneral.name)
    private readonly generalModel: Model<AboutGeneralDocument>,
    @InjectPortfolioModel(AboutTranslation.name)
    private readonly translationModel: Model<AboutTranslationDocument>,
    @Inject('IStorageService') private readonly storageService: IStorageService,
  ) {}

  async getByLocale(locale: LocaleType): Promise<AboutPlain> {
    const translation = await this.translationModel.findOne({ locale }).lean().exec();
    if (!translation) throw new NotFoundException(`No about found for locale "${locale}"`);

    const general = await this.generalModel.findById(translation.general).lean().exec();
    if (!general) throw new NotFoundException('General about info not found');

    return {
      ...translation,
      general,
    };
  }

  async getAll(): Promise<{ general: AboutGeneral; translations: AboutTranslation[] }> {
    const general = await this.generalModel.findOne().lean().exec();
    if (!general) throw new NotFoundException('General about info not found');

    const translations = await this.translationModel.find().lean().exec();

    return {
      general,
      translations,
    };
  }

  async createGeneral(body: CreateGeneralAboutDto, image?: Express.Multer.File) {
    const exists = await this.generalModel.findOne().lean().exec();
    if (exists) {
      throw new ConflictException('About General info already exists');
    }
    const imageData = image ? await this.uploadFile(image, 'portfolio/about') : null;

    const general = await this.generalModel.create({
      fullName: body.fullName,
      birthYear: body.birthYear,
      location: body.location,
      image: imageData,
      positioningTags: body.positioningTags,
    });

    return general.toObject();
  }

  async updateGeneral(body: UpdateGeneralAboutDto, image?: Express.Multer.File) {
    const general = await this.generalModel.findOne().exec();
    if (!general) {
      throw new NotFoundException('General about info not found');
    }

    Object.assign(
      general,
      pickDefined(body, ['fullName', 'birthYear', 'location', 'positioningTags']),
    );

    if (image) {
      if (general.image?.publicId) {
        await this.storageService.deleteFile(general.image.publicId);
      }

      general.image = await this.uploadFile(image, 'portfolio/about');
    }

    await general.save();

    return general.toObject();
  }

  async addTranslation(
    body: AddTranslationAboutDto,
    cv?: Express.Multer.File,
  ): Promise<AboutPlain> {
    const exists = await this.translationModel.findOne({ locale: body.locale }).lean().exec();
    if (exists) {
      throw new ConflictException(`About info already exists for locale "${body.locale}"`);
    }

    const general = await this.generalModel.findOne().exec();
    if (!general) {
      throw new NotFoundException('General about info not found');
    }

    const cvData = cv ? await this.uploadFile(cv, 'portfolio/about', 'raw') : null;

    const translation = new this.translationModel({
      locale: body.locale,
      title: body.title,
      bio: body.bio,
      tagline: body.tagline,
      cv: cvData,
      general: general._id,
    });

    await translation.save();

    return {
      ...translation.toObject(),
      general: general.toObject(),
    };
  }

  async updateTranslation(
    body: UpdateTranslationAboutDto,
    cv?: Express.Multer.File,
  ): Promise<AboutPlain> {
    const { locale } = body;
    const translation = await this.translationModel
      .findOne({ locale })
      .populate<{ general: AboutGeneralDocument }>('general')
      .exec();
    if (!translation) {
      throw new NotFoundException(`No about info found for locale "${locale}"`);
    }

    // Update translation fields
    Object.assign(translation, pickDefined(body, ['title', 'bio', 'tagline']));
    if (cv) {
      if (translation.cv?.publicId) {
        await this.storageService.deleteFile(translation.cv.publicId, 'raw');
      }

      translation.cv = await this.uploadFile(cv, 'portfolio/about', 'raw');
    }

    await translation.save();

    return translation.toObject();
  }

  async updateByLocale(
    locale: LocaleType,
    body: UpdateAboutDto,
    image?: Express.Multer.File,
    cv?: Express.Multer.File,
  ): Promise<AboutPlain> {
    const translation = await this.translationModel.findOne({ locale }).exec();
    if (!translation) {
      throw new NotFoundException(`No about info found for locale "${locale}"`);
    }

    const general: AboutGeneralDocument | null = await this.generalModel
      .findById(translation.general)
      .exec();
    if (!general) {
      throw new NotFoundException('General about info not found');
    }

    // Update translation fields
    Object.assign(translation, pickDefined(body, ['title', 'bio', 'tagline']));
    if (cv) {
      if (translation.cv?.publicId) {
        await this.storageService.deleteFile(translation.cv.publicId, 'raw');
      }

      translation.cv = await this.uploadFile(cv, 'portfolio/about', 'raw');
    }

    // Update general fields
    Object.assign(
      general,
      pickDefined(body, ['fullName', 'birthYear', 'location', 'positioningTags']),
    );

    if (image) {
      if (general.image?.publicId) {
        await this.storageService.deleteFile(general.image.publicId);
      }

      general.image = await this.uploadFile(image, 'portfolio/about');
    }

    await Promise.all([translation.save(), general.save()]);

    return {
      ...translation.toObject(),
      general: general.toObject(),
    };
  }

  async deleteTranslation(locale: LocaleType) {
    const translation = await this.translationModel.findOne({ locale }).exec();

    if (!translation) {
      throw new NotFoundException(`Translation with locale "${locale}" not found`);
    }

    if (translation.cv?.publicId) {
      await this.storageService.deleteFile(translation.cv.publicId, 'raw');
    }

    await translation.deleteOne();
  }

  private async uploadFile(
    file: Express.Multer.File,
    folder: string,
    resourceType?: 'image' | 'raw' | 'video',
  ): Promise<FileMetadata> {
    const { publicId, url } = await this.storageService.uploadFile({
      fileBuffer: file.buffer,
      filename: file.originalname,
      mimetype: file.mimetype,
      folder,
      resourceType,
    });

    return { publicId, url };
  }
}
