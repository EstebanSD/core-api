import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UploadedFiles,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto, FindProjectsDto, AddTranslationDto } from './dtos';
import { MultiImageUploadInterceptor } from 'src/common/interceptors';

@Controller('portfolio/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAll(@Query() query: FindProjectsDto) {
    return this.projectService.findAll(query);
  }

  @Get(':generalId/locale/:locale')
  findOne(@Param('generalId') generalId: string, @Param('locale') locale: string) {
    return this.projectService.findOne(generalId, locale);
  }

  @Post()
  @MultiImageUploadInterceptor({ maxCount: 5, maxSizeMB: 4, deniedTypes: ['image/svg+xml'] })
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

  @Patch(':translationId')
  @MultiImageUploadInterceptor({ maxCount: 5, maxSizeMB: 4, deniedTypes: ['image/svg+xml'] })
  update(
    @Param('translationId') id: string,
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

  @Post(':generalId/locale')
  addTranslation(@Param('generalId') id: string, @Body() body: AddTranslationDto) {
    return this.projectService.addTranslation(id, body);
  }

  @Delete(':generalId')
  deleteAll(@Param('generalId') id: string) {
    return this.projectService.deleteProject(id);
  }

  @Delete(':generalId/locale/:locale')
  deleteOne(@Param('generalId') id: string, @Param('locale') locale: string) {
    return this.projectService.deleteTranslation(id, locale);
  }
}
