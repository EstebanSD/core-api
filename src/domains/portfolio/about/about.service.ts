import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectPortfolioModel } from 'src/common/helpers';
import {
  AboutPlain,
  AboutGeneral,
  AboutGeneralDocument,
  AboutTranslation,
  AboutTranslationDocument,
} from '../schemas/about.schema';
import { CreateAboutDto, UpdateAboutDto } from './dtos';
import { IStorageService } from 'src/libs/storage';
import { LocaleType } from 'src/types';

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

    const generalInfo = await this.generalModel.findById(translation.generalInfo).lean().exec();
    if (!generalInfo) throw new NotFoundException('General about info not found');

    return {
      ...translation,
      generalInfo: generalInfo,
    };
  }

  async createByLocale(body: CreateAboutDto, file?: Express.Multer.File): Promise<AboutPlain> {
    const exists = await this.translationModel.findOne({ locale: body.locale }).lean().exec();
    if (exists) {
      throw new ConflictException(`About info already exists for locale "${body.locale}"`);
    }

    let general: AboutGeneralDocument | null = await this.generalModel.findOne().exec();
    if (!general) {
      let imageData: { publicId: string; url: string } | null = null;

      if (file) {
        const { publicId, url } = await this.storageService.uploadFile({
          fileBuffer: file.buffer,
          filename: file.originalname,
          mimetype: file.mimetype,
          folder: 'portfolio/about',
        });

        imageData = { publicId, url };
      }

      general = new this.generalModel({
        image: imageData,
        socialLinks: body.socialLinks,
      });

      await general.save();
    }

    const translation = new this.translationModel({
      locale: body.locale,
      fullName: body.fullName,
      role: body.role,
      bio: body.bio,
      generalInfo: general._id,
    });

    await translation.save();

    return {
      ...translation.toObject(),
      generalInfo: general.toObject(),
    };
  }

  async updateByLocale(
    locale: LocaleType,
    body: UpdateAboutDto,
    file?: Express.Multer.File,
  ): Promise<AboutPlain> {
    const translation = await this.translationModel.findOne({ locale }).exec();
    if (!translation) {
      throw new NotFoundException(`No about info found for locale "${locale}"`);
    }

    const general: AboutGeneralDocument | null = await this.generalModel
      .findById(translation.generalInfo)
      .exec();
    if (!general) {
      throw new NotFoundException('General about info not found');
    }
    const { fullName, role, bio } = body;

    Object.assign(translation, {
      ...(fullName && { fullName }),
      ...(role && { role }),
      ...(bio && { bio }),
    });

    if (file) {
      if (general.image?.publicId) {
        await this.storageService.deleteFile(general.image.publicId);
      }

      const { publicId, url } = await this.storageService.uploadFile({
        fileBuffer: file.buffer,
        filename: file.originalname,
        mimetype: file.mimetype,
        folder: 'portfolio/about',
      });

      general.image = { publicId, url };
    }

    if (body.socialLinks !== undefined) {
      general.socialLinks = body.socialLinks;
    }

    await Promise.all([translation.save(), general.save()]);

    return {
      ...translation.toObject(),
      generalInfo: general.toObject(),
    };
  }
}
