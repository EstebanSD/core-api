import { Controller, Get, Post, Body, Query, UploadedFiles, Patch, Param } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project } from '../schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto, FindProjectsDto } from './dtos';
import { MultiImageUploadInterceptor } from 'src/common/interceptors';

@Controller('portfolio/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAll(@Query() query: FindProjectsDto): Promise<Project[]> {
    return this.projectService.findAll(query);
  }

  @Post()
  @MultiImageUploadInterceptor('files', 5, 4)
  create(@Body() body: CreateProjectDto, @UploadedFiles() files: Express.Multer.File[]) {
    return this.projectService.create(
      body,
      files?.map((file) => ({
        fileBuffer: file.buffer,
        filename: file.originalname,
        mimetype: file.mimetype,
      })),
    );
  }

  @Patch(':id')
  @MultiImageUploadInterceptor('files', 5, 4)
  update(
    @Param('id') id: string,
    @Body() body: UpdateProjectDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.projectService.update(
      id,
      body,
      files?.map((file) => ({
        fileBuffer: file.buffer,
        filename: file.originalname,
        mimetype: file.mimetype,
      })),
    );
  }
}
