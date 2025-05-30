import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private projectModel: Model<ProjectDocument>) {}

  async findAll(): Promise<Project[]> {
    return this.projectModel.find().exec();
  }

  async create(data: Partial<Project>): Promise<Project> {
    const created = new this.projectModel(data);
    return created.save();
  }
}
