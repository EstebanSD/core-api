import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UploadedFiles,
  Query,
  Req,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { AboutService } from './about.service';
import { CreateAboutDto, UpdateAboutDto } from './dtos';
import { Auth, MultiFieldUploadInterceptor, Roles } from 'src/common/decorators';
import { LocaleType } from 'src/types';
import { UploadCvField, UploadImageField } from 'src/common/constants';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('portfolio/about')
export class AboutController {
  constructor(
    private readonly service: AboutService,
    private readonly customLogger: CustomLoggerService,
  ) {}

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

  @Get('resume/download')
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 requests per 15 minutes
  async downloadCv(
    @Query('locale') locale: LocaleType,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    this.customLogger.setContext('AboutController');

    try {
      this.customLogger.log(
        `CV download attempt - Locale: ${locale}, IP: ${request.ip}, UserAgent: ${request.get('User-Agent')}`,
        undefined,
        'cv_download',
      );

      const aboutData = await this.service.getByLocale(locale);

      if (!aboutData.cv) {
        throw new NotFoundException(`CV not found for locale "${locale}"`);
      }

      response.set({
        'Cache-Control': 'public, max-age=3600, must-revalidate',
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CV-${aboutData.general.fullName}-${locale}.pdf"`,
        ETag: `"cv-${locale}-${Date.now()}"`,
      });

      this.customLogger.log(
        `CV download successful - Locale: ${locale}, File: ${aboutData.cv.publicId}`,
        undefined,
        'cv_download',
      );

      return response.redirect(aboutData.cv.url);
    } catch (error) {
      this.customLogger.error(
        `CV download failed - Locale: ${locale}`,
        error,
        'AboutController/cv-download',
      );
      throw error;
    }
  }
}
