import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectPortfolioModel } from 'src/common/helpers';
import {
  ProjectDocument,
  ProjectGeneral,
  ProjectGeneralDocument,
  ProjectPlain,
  ProjectTranslation,
  ProjectTranslationDocument,
} from './schemas';
import { CreateProjectDto, UpdateProjectDto, FindProjectsDto, AddTranslationDto } from './dtos';
import { IStorageService, StorageUploadParams, uploadMultiple } from 'src/libs/storage';
import { LocaleType } from 'src/types';

@Injectable()
export class ProjectService {
  constructor(
    @InjectPortfolioModel(ProjectGeneral.name)
    private readonly generalModel: Model<ProjectGeneralDocument>,
    @InjectPortfolioModel(ProjectTranslation.name)
    private readonly translationModel: Model<ProjectTranslationDocument>,
    @Inject('IStorageService') private readonly storageService: IStorageService,
  ) {}

  async create(body: CreateProjectDto, files?: StorageUploadParams[]): Promise<ProjectPlain> {
    const exists = await this.translationModel
      .findOne({ title: body.title, locale: body.locale })
      .lean()
      .exec();

    if (exists) {
      throw new ConflictException(
        `Project with title "${body.title}" already exists for locale "${body.locale}"`,
      );
    }

    const imagesData = await uploadMultiple(this.storageService, 'portfolio/projects', files ?? []);

    const general = await this.generalModel.create({
      status: body.status,
      type: body.type,
      startDate: body.startDate,
      endDate: body.endDate,
      technologies: body.technologies,
      links: body.links,
      images: imagesData,
    });

    const translation = await this.translationModel.create({
      title: body.title,
      description: body.description,
      locale: body.locale,
      general: general._id,
    });

    const populated = await translation.populate('general');
    return populated.toObject() as unknown as ProjectPlain;
  }

  async findGroupedByGeneral(query: FindProjectsDto): Promise<Record<string, ProjectPlain[]>> {
    const { locale, status, type } = query;

    const filter: Record<string, string> = {};
    if (locale) filter.locale = locale;

    const translations = await this.translationModel
      .find(filter)
      .populate<ProjectDocument>({
        path: 'general',
        match: {
          ...(status && { status }),
          ...(type && { type }),
        },
      })
      .lean()
      .exec();

    const grouped: Record<string, ProjectPlain[]> = {};

    for (const t of translations) {
      if (!t.general) continue;
      const generalId = t.general._id.toString();

      if (!grouped[generalId]) grouped[generalId] = [];

      grouped[generalId].push({
        ...t,
        general: {
          ...(t.general as ProjectGeneral),
          _id: generalId,
        },
      });
    }

    return grouped;
  }

  async findAllByLocale(query: FindProjectsDto): Promise<ProjectPlain[]> {
    const { locale = 'en', status, type } = query;

    const filter: Record<string, string> = {};
    filter.locale = locale;

    const translations = await this.translationModel
      .find(filter)
      .populate<ProjectDocument>({
        path: 'general',
        match: {
          ...(status && { status }),
          ...(type && { type }),
        },
      })
      .lean()
      .exec();

    return translations
      .filter((t) => t.general)
      .map((t) => ({
        ...t,
        general: {
          ...(t.general as ProjectGeneral),
          _id: t.general._id.toString(),
        },
      }));
  }

  async findOne(generalId: string, locale: LocaleType): Promise<ProjectPlain> {
    const generalObjectId = new Types.ObjectId(generalId);
    const translation = await this.translationModel
      .findOne({ general: generalObjectId, locale })
      .populate<ProjectDocument>('general')
      .exec();

    if (!translation || !translation.general) {
      throw new NotFoundException('Project not found');
    }
    return translation.toObject() as unknown as ProjectPlain;
  }

  async update(
    translationId: string,
    body: UpdateProjectDto,
    files?: StorageUploadParams[],
  ): Promise<ProjectPlain> {
    const translation = await this.translationModel
      .findById(translationId)
      .populate<ProjectDocument>('general')
      .exec();

    if (!translation) {
      throw new NotFoundException(`Project translation with id "${translationId}" not found`);
    }

    const general = translation.general;

    const { title, description, status, type, startDate, endDate, technologies, links } = body;

    Object.assign(translation, {
      ...(title && { title }),
      ...(description && { description }),
    });

    Object.assign(general, {
      ...(status && { status }),
      ...(type && { type }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      ...(technologies !== undefined && { technologies }),
      ...(links !== undefined && { links }),
    });

    if (files?.length) {
      if (general.images?.length) {
        await Promise.all(
          general.images.map((img) => this.storageService.deleteFile(img.publicId)),
        );
      }

      const imagesData = await uploadMultiple(this.storageService, 'portfolio/projects', files);
      general.images = imagesData;
    }

    await general.save();
    await translation.save();

    const populated = await translation.populate('general');
    return populated.toObject() as unknown as ProjectPlain;
  }

  async addTranslation(generalId: string, body: AddTranslationDto): Promise<ProjectPlain> {
    const general = await this.generalModel.findById(generalId).exec();

    if (!general) {
      throw new NotFoundException(`General project with id "${generalId}" not found`);
    }

    const exists = await this.translationModel.exists({
      general: generalId,
      locale: body.locale,
    });

    if (exists) {
      throw new ConflictException(`Translation for locale "${body.locale}" already exists`);
    }

    const translation = await this.translationModel.create({
      ...body,
      general: general._id,
    });

    return {
      ...translation.toObject(),
      general: general.toObject() as unknown as ProjectGeneral & { _id: string },
    };
  }

  async deleteProject(generalId: string): Promise<void> {
    const general = await this.generalModel.findById(generalId);
    if (!general) {
      throw new NotFoundException(`Project with id "${generalId}" not found`);
    }

    if (general.images?.length) {
      await Promise.all(general.images.map((img) => this.storageService.deleteFile(img.publicId)));
    }

    await this.translationModel.deleteMany({ general: general._id });

    await this.generalModel.findByIdAndDelete(general._id);
  }

  async deleteTranslation(
    generalId: string,
    locale: LocaleType,
  ): Promise<{ projectGeneralDeleted: boolean }> {
    const generalObjectId = new Types.ObjectId(generalId);
    const translation = await this.translationModel
      .findOne({ locale, general: generalObjectId })
      .populate<ProjectDocument>('general')
      .exec();

    if (!translation) {
      throw new NotFoundException(`Translation with locale "${locale}" not found`);
    }

    const general = translation.general;

    await this.translationModel.findByIdAndDelete(translation._id);

    const remaining = await this.translationModel.countDocuments({ general: general._id });
    if (remaining === 0) {
      if (general.images?.length) {
        await Promise.all(
          general.images.map((img) => this.storageService.deleteFile(img.publicId)),
        );
      }

      await this.generalModel.findByIdAndDelete(general._id);

      return { projectGeneralDeleted: true };
    }

    return { projectGeneralDeleted: false };
  }
}
