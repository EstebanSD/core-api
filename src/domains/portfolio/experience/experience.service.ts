import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectPortfolioModel, pickDefined } from 'src/common/helpers';
import { Model, Types } from 'mongoose';
import {
  ExperienceGeneral,
  ExperienceGeneralDocument,
  ExperienceGeneralPlain,
  ExperiencePlain,
  ExperienceTranslation,
  ExperienceTranslationDocument,
} from './schemas';
import { IStorageService } from 'src/libs/storage';
import { SanitizerService } from 'src/libs/sanitizer';
import {
  CreateExperienceGeneralDto,
  AddExpTranslationDto,
  FindExperiencesDto,
  UpdateExperienceDto,
} from './dtos';
import { FileMetadata } from 'src/types/interfaces';
import { LocaleType } from 'src/types';

@Injectable()
export class ExperienceService {
  constructor(
    @InjectPortfolioModel(ExperienceGeneral.name)
    private readonly generalModel: Model<ExperienceGeneralDocument>,
    @InjectPortfolioModel(ExperienceTranslation.name)
    private readonly translationModel: Model<ExperienceTranslationDocument>,
    @Inject('IStorageService') private readonly storageService: IStorageService,
    private readonly sanitizerService: SanitizerService,
  ) {}

  async findAllByLocale(query: FindExperiencesDto): Promise<ExperiencePlain[]> {
    const { locale = 'en', position, companyName, type } = query;

    const filter: Record<string, unknown> = {};
    filter.locale = locale;
    if (position) {
      filter.position = { $regex: position, $options: 'i' };
    }

    const translations = await this.translationModel
      .find(filter)
      .populate<{ general: ExperienceGeneralDocument }>({
        path: 'general',
        match: {
          ...(companyName && { companyName: { $regex: companyName, $options: 'i' } }),
          ...(type && { type }),
        },
      })
      .lean()
      .exec();

    return translations
      .filter((t) => t.general)
      .sort((a, b) => {
        if (a.general.ongoing && !b.general.ongoing) return -1;
        if (!a.general.ongoing && b.general.ongoing) return 1;

        return new Date(b.general.startDate).getTime() - new Date(a.general.startDate).getTime();
      })
      .map((t) => ({
        ...t,
        general: {
          ...t.general,
        },
      }));
  }

  async findOne(generalId: string, locale: LocaleType): Promise<ExperiencePlain> {
    const generalObjectId = new Types.ObjectId(generalId);
    const translation = await this.translationModel
      .findOne({ general: generalObjectId, locale })
      .populate<{ general: ExperienceGeneralDocument }>('general')
      .exec();

    if (!translation || !translation.general) {
      throw new NotFoundException('Project not found');
    }
    return translation.toObject();
  }

  async createGeneral(
    body: CreateExperienceGeneralDto,
    logo?: Express.Multer.File,
  ): Promise<ExperienceGeneralPlain> {
    const existing = await this.generalModel
      .findOne({ companyName: body.companyName })
      .lean()
      .exec();

    if (existing) {
      throw new ConflictException(`Experience with key "${body.companyName}" already exists`);
    }

    let logoData: FileMetadata | null = null;
    if (logo) {
      let fileBuffer = logo.buffer;

      // If the file is an SVG, sanitize it
      if (logo.mimetype === 'image/svg+xml') {
        const rawSvg = logo.buffer.toString('utf-8');
        const cleanSvg = this.sanitizerService.sanitizeSvg(rawSvg);
        fileBuffer = Buffer.from(cleanSvg, 'utf-8');
      }

      const { publicId, url } = await this.storageService.uploadFile({
        fileBuffer,
        filename: logo.originalname,
        mimetype: logo.mimetype,
        folder: 'portfolio/experiences',
      });

      logoData = { publicId, url };
    }

    const created = new this.generalModel({ ...body, companyLogo: logoData });

    const experience = await created.save();
    return experience.toObject();
  }

  async addTranslation(generalId: string, body: AddExpTranslationDto): Promise<ExperiencePlain> {
    const general = await this.generalModel.findById(generalId).lean().exec();
    if (!general) {
      throw new NotFoundException(`Experience with id "${generalId}" not found`);
    }

    const existing = await this.translationModel
      .findOne({
        general: general._id,
        locale: body.locale,
      })
      .exec();

    if (existing) {
      throw new ConflictException(`Translation for locale "${body.locale}" already exists`);
    }

    const created = new this.translationModel({
      ...body,
      general: general._id,
    });

    const translation = await created.save();
    return { ...translation.toObject(), general };
  }

  async update(
    translationId: string,
    body: UpdateExperienceDto,
    logo?: Express.Multer.File,
  ): Promise<ExperiencePlain> {
    const translation = await this.translationModel
      .findById(translationId)
      .populate<{ general: ExperienceGeneralDocument }>('general')
      .exec();

    if (!translation) {
      throw new NotFoundException(`Experience translation with id "${translationId}" not found`);
    }

    const general = translation.general;

    // Maintain CompanyName as unique
    if (body.companyName && body.companyName !== general.companyName) {
      const fastThrow = await this.generalModel
        .findOne({ companyName: body.companyName })
        .lean()
        .exec();
      if (fastThrow) {
        throw new ConflictException(
          `Experience with company name "${body.companyName}" already exists`,
        );
      }
    }

    Object.assign(translation, pickDefined(body, ['position', 'description']));

    Object.assign(
      general,
      pickDefined(body, [
        'companyName',
        'type',
        'location',
        'technologies',
        'startDate',
        'endDate',
        'ongoing',
      ]),
    );

    // Dates Validations
    this.validateExperienceDates(general);

    if (logo) {
      let fileBuffer = logo.buffer;

      // If the file is an SVG, sanitize it
      if (logo.mimetype === 'image/svg+xml') {
        const rawSvg = logo.buffer.toString('utf-8');
        const cleanSvg = this.sanitizerService.sanitizeSvg(rawSvg);
        fileBuffer = Buffer.from(cleanSvg, 'utf-8');
      }

      if (general.companyLogo?.publicId) {
        await this.storageService.deleteFile(general.companyLogo.publicId);
      }

      const { publicId, url } = await this.storageService.uploadFile({
        fileBuffer,
        filename: logo.originalname,
        mimetype: logo.mimetype,
        folder: 'portfolio/experiences',
      });

      general.companyLogo = { publicId, url };
    }

    await general.save();
    await translation.save();

    return { ...translation.toObject(), general: general.toObject() };
  }

  async deleteExperience(generalId: string): Promise<void> {
    const general = await this.generalModel.findById(generalId);
    if (!general) {
      throw new NotFoundException(`experience with id "${generalId}" not found`);
    }

    if (general.companyLogo?.publicId) {
      await this.storageService.deleteFile(general.companyLogo.publicId);
    }

    await this.translationModel.deleteMany({ general: general._id });

    await this.generalModel.findByIdAndDelete(general._id);
  }

  async deleteTranslation(
    generalId: string,
    locale: LocaleType,
  ): Promise<{ experienceGeneralDeleted: boolean }> {
    const generalObjectId = new Types.ObjectId(generalId);
    const translation = await this.translationModel
      .findOne({ locale, general: generalObjectId })
      .populate<{ general: ExperienceGeneralDocument }>('general')
      .exec();

    if (!translation) {
      throw new NotFoundException(`Translation with locale "${locale}" not found`);
    }

    const general = translation.general;

    await this.translationModel.findByIdAndDelete(translation._id);

    const remaining = await this.translationModel.countDocuments({ general: general._id });
    if (remaining === 0) {
      if (general.companyLogo?.publicId) {
        await this.storageService.deleteFile(general.companyLogo.publicId);
      }

      await this.generalModel.findByIdAndDelete(general._id);

      return { experienceGeneralDeleted: true };
    }

    return { experienceGeneralDeleted: false };
  }

  private validateExperienceDates(doc: ExperienceGeneralDocument) {
    if (doc.startDate) {
      const start = new Date(doc.startDate);
      const end = doc.endDate ? new Date(doc.endDate) : null;

      if (doc.ongoing === true && end) {
        throw new BadRequestException('Ongoing experience cannot have an endDate');
      }

      if ((doc.ongoing === false || doc.ongoing === undefined) && !end) {
        throw new BadRequestException('End date is required unless experience is ongoing');
      }

      if (end && end <= start) {
        throw new BadRequestException('End date must be after start date');
      }
    }
  }
}
