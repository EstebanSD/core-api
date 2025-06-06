import { Controller, Get, Post, Body, Patch, Param, UploadedFile } from '@nestjs/common';
import { AboutService } from './about.service';
import { CreateAboutDto, UpdateAboutDto } from './dtos';
import { ImageUploadInterceptor } from 'src/common/interceptors';

@Controller('portfolio/about')
export class AboutController {
  constructor(private readonly service: AboutService) {}

  @Get(':locale')
  get(@Param('locale') locale: string) {
    return this.service.getByLocale(locale);
  }

  @Post()
  @ImageUploadInterceptor({ deniedTypes: ['image/svg+xml'] })
  create(@Body() body: CreateAboutDto, @UploadedFile() file: Express.Multer.File) {
    return this.service.createByLocale(body, {
      fileBuffer: file?.buffer,
      filename: file?.originalname,
      mimetype: file?.mimetype,
    });
  }

  @Patch(':locale')
  @ImageUploadInterceptor({ deniedTypes: ['image/svg+xml'] })
  update(
    @Param('locale') locale: string,
    @Body() body: UpdateAboutDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.updateByLocale(locale, body, {
      fileBuffer: file?.buffer,
      filename: file?.originalname,
      mimetype: file?.mimetype,
    });
  }
}
