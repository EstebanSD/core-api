import { Controller, Get, Post, Body, Patch, Param, UploadedFiles } from '@nestjs/common';
import { AboutService } from './about.service';
import { CreateAboutDto, UpdateAboutDto } from './dtos';
import { Auth, MultiFieldUploadInterceptor, Roles } from 'src/common/decorators';
import { LocaleType } from 'src/types';
import { UploadCvField, UploadImageField } from 'src/common/constants';

@Controller('portfolio/about')
export class AboutController {
  constructor(private readonly service: AboutService) {}

  @Get(':locale')
  get(@Param('locale') locale: LocaleType) {
    return this.service.getByLocale(locale);
  }

  @Auth()
  @Roles('Admin')
  @Post()
  @MultiFieldUploadInterceptor([UploadImageField, UploadCvField])
  create(
    @Body() body: CreateAboutDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      cv?: Express.Multer.File[];
    },
  ) {
    const image = files.image?.[0];
    const cv = files.cv?.[0];
    return this.service.createByLocale(body, image, cv);
  }

  @Auth()
  @Roles('Admin')
  @Patch(':locale')
  @MultiFieldUploadInterceptor([UploadImageField, UploadCvField])
  update(
    @Param('locale') locale: LocaleType,
    @Body() body: UpdateAboutDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      cv?: Express.Multer.File[];
    },
  ) {
    const image = files.image?.[0];
    const cv = files.cv?.[0];
    return this.service.updateByLocale(locale, body, image, cv);
  }
}
