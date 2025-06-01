import { Controller, Get, Post, Body, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project } from '../schemas/project.schema';
import { CreateProjectDto } from './dtos/create-project.dto';
import { FindProjectsDto } from './dtos/find-project.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('portfolio/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAll(@Query() query: FindProjectsDto): Promise<Project[]> {
    return this.projectService.findAll(query);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  create(@Body() body: CreateProjectDto, @UploadedFile() file: Express.Multer.File) {
    return this.projectService.create({
      ...body,
      fileBuffer: file?.buffer,
      filename: file?.originalname,
      mimetype: file?.mimetype,
    });
  }
}
