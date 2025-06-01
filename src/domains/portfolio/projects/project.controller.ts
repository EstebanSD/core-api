import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project } from '../schemas/project.schema';
import { CreateProjectDto } from './dtos/create-project.dto';
import { FindProjectsDto } from './dtos/find-project.dto';

@Controller('portfolio/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAll(@Query() query: FindProjectsDto): Promise<Project[]> {
    return this.projectService.findAll(query);
  }

  @Post()
  create(@Body() body: CreateProjectDto) {
    return this.projectService.create(body);
  }
}
