import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { CreateProjectDto } from './dtos/create-project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { FindProjectsDto } from './dtos/find-project.dto';

@Injectable()
export class ProjectService {
  constructor(@InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const exists = await this.projectModel
      .findOne({
        title: dto.title,
        locale: dto.locale,
      })
      .exec();

    if (exists) {
      throw new ConflictException(
        `Project with title "${dto.title}" already exists for locale "${dto.locale}"`,
      );
    }

    const created = new this.projectModel(dto);
    return created.save();
  }

  async findAll(query: FindProjectsDto): Promise<Project[]> {
    return this.projectModel.find(query).exec();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<void> {
    const updated = await this.projectModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();

    if (!updated) throw new NotFoundException('Project not found');

    return;
  }

  // async remove(id: string): Promise<void> {
  //   const result = await this.projectModel.findByIdAndDelete(id).exec();
  //   if (!result) throw new NotFoundException('Project not found');
  // }
}
