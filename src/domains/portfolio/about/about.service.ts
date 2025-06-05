import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AboutPlain,
  AboutGeneral,
  AboutGeneralDocument,
  AboutTranslation,
  AboutTranslationDocument,
} from '../schemas/about.schema';
import { CreateAboutDto, UpdateAboutDto } from './dtos';
import { IStorageService, UploadFileParams } from 'src/libs/storage/interfaces';
import { uploadSingle } from 'src/libs/storage/helpers';

@Injectable()
export class AboutService {
  constructor(
    @InjectModel(AboutGeneral.name) private readonly generalModel: Model<AboutGeneralDocument>,
    @InjectModel(AboutTranslation.name)
    private readonly translationModel: Model<AboutTranslationDocument>,
    @Inject('IStorageService') private readonly storageService: IStorageService,
  ) {}

  async getByLocale(locale: string): Promise<AboutPlain> {
    const translation = await this.translationModel.findOne({ locale }).exec();
    if (!translation) throw new NotFoundException(`No about found for locale "${locale}"`);

    const generalInfo = await this.generalModel.findById(translation.generalInfo).exec();
    if (!generalInfo) throw new NotFoundException('General about info not found');

    return {
      ...translation.toObject(),
      generalInfo: generalInfo.toObject(),
    };
  }

  async createByLocale(body: CreateAboutDto, file: UploadFileParams): Promise<AboutPlain> {
    const exists = await this.translationModel.findOne({ locale: body.locale }).exec();
    if (exists) {
      throw new ConflictException(`About info already exists for locale "${body.locale}"`);
    }

    let general: AboutGeneralDocument | null = await this.generalModel.findOne().exec();
    if (!general) {
      const imageData = await uploadSingle(
        this.storageService,
        'portfolio/about',
        file.fileBuffer,
        file.filename,
        file.mimetype,
      );

      general = new this.generalModel({
        image: imageData ?? undefined,
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
    locale: string,
    body: UpdateAboutDto,
    file: UploadFileParams,
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

    const hasNewImage = file.fileBuffer && file.filename && file.mimetype;

    if (hasNewImage) {
      const imageData = await uploadSingle(
        this.storageService,
        'portfolio/about',
        file.fileBuffer,
        file.filename,
        file.mimetype,
      );

      if (imageData) {
        if (general.image?.publicId) {
          await this.storageService.deleteFile(general.image.publicId);
        }
        general.image = imageData;
      }
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
