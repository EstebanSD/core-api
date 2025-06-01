import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  About,
  AboutGeneral,
  AboutGeneralDocument,
  AboutTranslation,
  AboutTranslationDocument,
} from '../schemas/about.schema';
import { CreateAboutDto } from './dtos/create-about.dto';
import { UpdateAboutDto } from './dtos/update-about.dto';

@Injectable()
export class AboutService {
  constructor(
    @InjectModel(AboutGeneral.name) private readonly generalModel: Model<AboutGeneralDocument>,
    @InjectModel(AboutTranslation.name)
    private readonly translationModel: Model<AboutTranslationDocument>,
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
      image: generalInfo.image,
      socialLinks: generalInfo.socialLinks,
    };
  }

  async createByLocale(dto: CreateAboutDto): Promise<void> {
    const exists = await this.translationModel.findOne({ locale: dto.locale }).exec();
    if (exists) {
      throw new ConflictException(`About info already exists for locale "${dto.locale}"`);
    }

    const generalExists = await this.generalModel.findOne().exec();
    if (generalExists) {
      await this.createTranslation(dto, generalExists._id);
      return;
    }

    const general = new this.generalModel({
      image: dto.image,
      socialLinks: dto.socialLinks,
    });
    const savedGeneral = await general.save();

    await this.createTranslation(dto, savedGeneral._id);
    return;
  }

  async updateByLocale(locale: string, dto: UpdateAboutDto): Promise<void> {
    const translation = await this.translationModel.findOne({ locale }).exec();
    if (!translation) {
      throw new NotFoundException(`No about info found for locale "${locale}"`);
    }

    translation.fullName = dto.fullName ?? translation.fullName;
    translation.role = dto.role ?? translation.role;
    translation.bio = dto.bio ?? translation.bio;
    await translation.save();

    if (dto.image !== undefined || dto.socialLinks !== undefined) {
      const general = await this.generalModel.findById(translation.generalInfo).exec();

      if (!general) {
        throw new NotFoundException('General about info not found');
      }

      general.image = dto.image ?? general.image;
      general.socialLinks = dto.socialLinks ?? general.socialLinks;
      await general.save();
    }
    return;
  }
}
