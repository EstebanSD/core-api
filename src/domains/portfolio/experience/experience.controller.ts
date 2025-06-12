import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { Auth, ImageUploadInterceptor, Roles } from 'src/common/decorators';
import {
  AddExpTranslationDto,
  CreateExperienceGeneralDto,
  FindExperiencesDto,
  UpdateExperienceDto,
} from './dtos';
import { LocaleType } from 'src/types';

@Controller('portfolio/experiences')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Get()
  findAllByLocale(@Query() query: FindExperiencesDto) {
    return this.experienceService.findAllByLocale(query);
  }

  @Get(':generalId/locale/:locale')
  findOne(@Param('generalId') generalId: string, @Param('locale') locale: LocaleType) {
    return this.experienceService.findOne(generalId, locale);
  }

  @Auth()
  @Roles('Admin')
  @Post()
  @ImageUploadInterceptor({ fieldName: 'logo' })
  createCategoryGeneral(
    @Body() body: CreateExperienceGeneralDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return this.experienceService.createGeneral(body, logo);
  }

  @Auth()
  @Roles('Admin')
  @Post(':generalId/locale')
  createCategory(@Param('generalId') generalId: string, @Body() body: AddExpTranslationDto) {
    return this.experienceService.addTranslation(generalId, body);
  }

  @Auth()
  @Roles('Admin')
  @Patch(':translationId')
  @ImageUploadInterceptor({ fieldName: 'logo' })
  update(
    @Param('translationId') id: string,
    @Body() body: UpdateExperienceDto,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    return this.experienceService.update(id, body, logo);
  }

  @Auth()
  @Roles('Admin')
  @Delete(':generalId')
  deleteAll(@Param('generalId') id: string) {
    return this.experienceService.deleteExperience(id);
  }

  @Auth()
  @Roles('Admin')
  @Delete(':generalId/locale/:locale')
  deleteOne(@Param('generalId') id: string, @Param('locale') locale: LocaleType) {
    return this.experienceService.deleteTranslation(id, locale);
  }
}
