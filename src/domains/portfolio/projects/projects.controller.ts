import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from '../schemas/project.schema';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Post()
  create(@Body() body: Partial<Project>) {
    return this.projectsService.create(body);
  }
}
