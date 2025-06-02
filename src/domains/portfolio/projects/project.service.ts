import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { CreateProjectDto } from './dtos/create-project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { FindProjectsDto } from './dtos/find-project.dto';
import { IStorageService, UploadFileParams } from 'src/libs/storage/interfaces';
import { uploadMultiple } from 'src/libs/storage/helpers';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @Inject('IStorageService') private readonly storageService: IStorageService,
  ) {}

  async create(body: CreateProjectDto, files?: UploadFileParams[]): Promise<Project> {
    const exists = await this.projectModel
      .findOne({
        title: body.title,
        locale: body.locale,
      })
      .exec();

    if (exists) {
      throw new ConflictException(
        `Project with title "${body.title}" already exists for locale "${body.locale}"`,
      );
    }

    const imagesData = await uploadMultiple(this.storageService, 'portfolio/projects', files ?? []);

    const created = new this.projectModel({
      ...body,
      images: imagesData,
    });
    return await created.save();
  }

  async findAll(query: FindProjectsDto): Promise<Project[]> {
    return this.projectModel.find(query).exec();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, body: UpdateProjectDto, files?: UploadFileParams[]): Promise<Project> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`Project with id "${id}" not found`);
    }

    Object.assign(project, {
      ...body,
    });

    if (files?.length) {
      if (project.images?.length) {
        await Promise.all(
          project.images.map((img) => this.storageService.deleteFile(img.publicId)),
        );
      }

      const imagesData = await uploadMultiple(this.storageService, 'portfolio/projects', files);
      project.images = imagesData;
    }

    return await project.save();
  }

  // async remove(id: string): Promise<void> {
  //   const result = await this.projectModel.findByIdAndDelete(id).exec();
  //   if (!result) throw new NotFoundException('Project not found');
  // }
}
