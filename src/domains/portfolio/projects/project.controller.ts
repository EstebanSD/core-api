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
import {
  CreateProjectGeneralDto,
  UpdateProjectDto,
  FindProjectsDto,
  AddProjectTranslationDto,
} from './dtos';
import { Auth, MultiImageUploadInterceptor, Roles } from 'src/common/decorators';
import { LocaleType } from 'src/types';

@Controller('portfolio/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAllByLocale(@Query() query: FindProjectsDto) {
    return this.projectService.findAllByLocale(query);
  }

  @Auth()
  @Roles('Admin')
  @Get('grouped')
  findGroupedByGeneral(@Query() query: FindProjectsDto) {
    return this.projectService.findGroupedByGeneral(query);
  }

  @Get(':generalId/locale/:locale')
  findOne(@Param('generalId') generalId: string, @Param('locale') locale: LocaleType) {
    return this.projectService.findOne(generalId, locale);
  }

  @Auth()
  @Roles('Admin')
  @Post()
  @MultiImageUploadInterceptor({ maxCount: 5, maxSizeMB: 4, deniedTypes: ['image/svg+xml'] })
  create(@Body() body: CreateProjectGeneralDto, @UploadedFiles() files?: Express.Multer.File[]) {
    return this.projectService.create(body, files);
  }

  @Auth()
  @Roles('Admin')
  @Post(':generalId/locale')
  addTranslation(@Param('generalId') id: string, @Body() body: AddProjectTranslationDto) {
    return this.projectService.addTranslation(id, body);
  }

  @Auth()
  @Roles('Admin')
  @Patch(':translationId')
  @MultiImageUploadInterceptor({ maxCount: 5, maxSizeMB: 4, deniedTypes: ['image/svg+xml'] })
  update(
    @Param('translationId') id: string,
    @Body() body: UpdateProjectDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.projectService.update(id, body, files);
  }

  @Auth()
  @Roles('Admin')
  @Delete(':generalId')
  deleteAll(@Param('generalId') id: string) {
    return this.projectService.deleteProject(id);
  }

  @Auth()
  @Roles('Admin')
  @Delete(':generalId/locale/:locale')
  deleteOne(@Param('generalId') id: string, @Param('locale') locale: LocaleType) {
    return this.projectService.deleteTranslation(id, locale);
  }
}
