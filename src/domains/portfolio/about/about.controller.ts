import { Controller, Get, Post, Body, Patch, Param, UploadedFile } from '@nestjs/common';
import { AboutService } from './about.service';
import { CreateAboutDto, UpdateAboutDto } from './dtos';
import { Auth, ImageUploadInterceptor, Roles } from 'src/common/decorators';
import { LocaleType } from 'src/types';

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
  @ImageUploadInterceptor({ deniedTypes: ['image/svg+xml'] })
  create(@Body() body: CreateAboutDto, @UploadedFile() file: Express.Multer.File) {
    return this.service.createByLocale(body, file);
  }

  @Auth()
  @Roles('Admin')
  @Patch(':locale')
  @ImageUploadInterceptor({ deniedTypes: ['image/svg+xml'] })
  update(
    @Param('locale') locale: LocaleType,
    @Body() body: UpdateAboutDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.updateByLocale(locale, body, file);
  }
}
