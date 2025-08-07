import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectPortfolioModel, pickDefined } from 'src/common/helpers';
import {
  ProjectGeneral,
  ProjectGeneralDocument,
  ProjectGeneralPlain,
  ProjectPlain,
  ProjectTranslation,
  ProjectTranslationDocument,
} from './schemas';
import {
  UpdateProjectDto,
  FindProjectsDto,
  CreateProjectGeneralDto,
  AddProjectTranslationDto,
} from './dtos';
import { IStorageService, uploadMultiple } from 'src/libs/storage';
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

  async findAllByLocale(query: FindProjectsDto): Promise<ProjectPlain[]> {
    const { locale = 'en', title, status, type } = query;

    const filter: Record<string, unknown> = {};
    filter.locale = locale;

    const translations = await this.translationModel
      .find(filter)
      .populate<{ general: ProjectGeneralDocument }>({
        path: 'general',
        match: {
          ...(title && { title: { $regex: title, $options: 'i' } }),
          ...(type && { type }),
          ...(status && { status }),
        },
      })
      .lean()
      .exec();

    return translations.filter((t) => t.general);
  }

  async findGroupedByGeneral(query: FindProjectsDto): Promise<Record<string, ProjectPlain[]>> {
    const { locale, status, type } = query;

    const filter: Record<string, string> = {};
    if (locale) filter.locale = locale;

    const translations = await this.translationModel
      .find(filter)
      .populate<{ general: ProjectGeneralDocument }>({
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

      grouped[generalId].push(t);
    }

    return grouped;
  }

  async findOne(generalId: string, locale: LocaleType): Promise<ProjectPlain> {
    const generalObjectId = new Types.ObjectId(generalId);
    const translation = await this.translationModel
      .findOne({ general: generalObjectId, locale })
      .populate<{ general: ProjectGeneralDocument }>('general')
      .exec();

    if (!translation || !translation.general) {
      throw new NotFoundException('Project not found');
    }
    return translation.toObject();
  }

  async create(
    body: CreateProjectGeneralDto,
    files?: Express.Multer.File[],
  ): Promise<ProjectGeneralPlain> {
    const exists = await this.generalModel.findOne({ title: body.title }).lean().exec();

    if (exists) {
      throw new ConflictException(`Project with title "${body.title}" already exists`);
    }

    const imagesData = await uploadMultiple(this.storageService, 'portfolio/projects', files ?? []);

    const general = await this.generalModel.create({
      title: body.title,
      type: body.type,
      startDate: body.startDate,
      endDate: body.endDate,
      status: body.status,
      technologies: body.technologies,
      links: body.links,
      images: imagesData,
    });

    return general.toObject();
  }

  async addTranslation(generalId: string, body: AddProjectTranslationDto): Promise<ProjectPlain> {
    const general = await this.generalModel.findById(generalId).lean().exec();

    if (!general) {
      throw new NotFoundException(`General project with id "${generalId}" not found`);
    }

    const exists = await this.translationModel.exists({
      general: general._id,
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
      general,
    };
  }

  async update(
    translationId: string,
    body: UpdateProjectDto,
    files?: Express.Multer.File[],
  ): Promise<ProjectPlain> {
    const translation = await this.translationModel
      .findById(translationId)
      .populate<{ general: ProjectGeneralDocument }>('general')
      .exec();

    if (!translation) {
      throw new NotFoundException(`Project translation with id "${translationId}" not found`);
    }

    const general = translation.general;

    // Maintain title as unique
    if (body.title && body.title !== general.title) {
      const fastThrow = await this.generalModel.findOne({ title: body.title }).lean().exec();
      if (fastThrow) {
        throw new ConflictException(`Project with title "${body.title}" already exists`);
      }
    }

    Object.assign(translation, pickDefined(body, ['summary', 'description']));

    Object.assign(
      general,
      pickDefined(body, [
        'title',
        'type',
        'startDate',
        'endDate',
        'status',
        'technologies',
        'links',
      ]),
    );

    // Dates Validations
    this.validateProjectDates(general);

    // TODO improve this. Because if I only change one image, they are all still deleted.
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

    return { ...translation.toObject(), general: general.toObject() };
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

    await general.deleteOne();
  }

  async deleteTranslation(
    generalId: string,
    locale: LocaleType,
  ): Promise<{ projectGeneralDeleted: boolean }> {
    const generalObjectId = new Types.ObjectId(generalId);
    const translation = await this.translationModel
      .findOne({ locale, general: generalObjectId })
      .populate<{ general: ProjectGeneralDocument }>('general')
      .exec();

    if (!translation) {
      throw new NotFoundException(`Translation with locale "${locale}" not found`);
    }

    const general = translation.general;

    await translation.deleteOne();

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

  private validateProjectDates(doc: ProjectGeneralDocument) {
    if (doc.startDate) {
      const start = new Date(doc.startDate);
      const end = doc.endDate ? new Date(doc.endDate) : null;

      if (doc.status === 'completed' && !end) {
        throw new BadRequestException('endDate is mandatory if status project is "completed"');
      }

      if (end && end <= start) {
        throw new BadRequestException('End date must be after start date');
      }
    }
  }
}
