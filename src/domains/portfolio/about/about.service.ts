import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  About,
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

  private async createTranslation(body: CreateAboutDto, id: Types.ObjectId): Promise<void> {
    const translation = new this.translationModel({
      locale: body.locale,
      fullName: body.fullName,
      role: body.role,
      bio: body.bio,
      generalInfo: id,
    });
    await translation.save();
    return;
  }

  async getByLocale(locale: string): Promise<About> {
    const translation = await this.translationModel.findOne({ locale }).exec();
    if (!translation) throw new NotFoundException(`No about found for locale "${locale}"`);

    const generalInfo = await this.generalModel.findById(translation.generalInfo).exec();
    if (!generalInfo) throw new NotFoundException('General about info not found');

    return {
      locale: translation.locale,
      fullName: translation.fullName,
      role: translation.role,
      bio: translation.bio,
      image: generalInfo.image?.url,
      socialLinks: generalInfo.socialLinks,
    };
  }

  async createByLocale(body: CreateAboutDto, file: UploadFileParams): Promise<void> {
    const exists = await this.translationModel.findOne({ locale: body.locale }).exec();
    if (exists) {
      throw new ConflictException(`About info already exists for locale "${body.locale}"`);
    }

    const generalExists = await this.generalModel.findOne().exec();
    if (generalExists) {
      await this.createTranslation(body, generalExists._id);
      return;
    }

    const imageData = await uploadSingle(
      this.storageService,
      'portfolio/about',
      file.fileBuffer,
      file.filename,
      file.mimetype,
    );

    const general = new this.generalModel({
      image: imageData ?? undefined,
      socialLinks: body.socialLinks,
    });
    const savedGeneral = await general.save();

    await this.createTranslation(body, savedGeneral._id);
    return;
  }

  async updateByLocale(
    locale: string,
    body: UpdateAboutDto,
    file: UploadFileParams,
  ): Promise<void> {
    const translation = await this.translationModel.findOne({ locale }).exec();
    if (!translation) {
      throw new NotFoundException(`No about info found for locale "${locale}"`);
    }

    const { fullName, role, bio, socialLinks } = body;

    if (fullName || role || bio) {
      translation.fullName = fullName ?? translation.fullName;
      translation.role = role ?? translation.role;
      translation.bio = bio ?? translation.bio;
      await translation.save();
    }

    const hasNewImage = file.fileBuffer && file.filename && file.mimetype;
    const shouldUpdateGeneral = hasNewImage || socialLinks !== undefined;

    if (!shouldUpdateGeneral) return;

    const general = await this.generalModel.findById(translation.generalInfo).exec();
    if (!general) {
      throw new NotFoundException('General about info not found');
    }

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

    if (socialLinks !== undefined) {
      general.socialLinks = socialLinks;
    }

    await general.save();
  }
}
