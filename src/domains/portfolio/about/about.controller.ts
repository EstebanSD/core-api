import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { AboutService } from './about.service';
import { CreateAboutDto } from './dtos/create-about.dto';
import { UpdateAboutDto } from './dtos/update-about.dto';

@Controller('portfolio/about')
export class AboutController {
  constructor(private readonly service: AboutService) {}

  @Get(':locale')
  get(@Param('locale') locale: string) {
    return this.service.getByLocale(locale);
  }

  @Post()
  create(@Body() dto: CreateAboutDto) {
    return this.service.createByLocale(dto);
  }

  @Patch(':locale')
  update(@Param('locale') locale: string, @Body() dto: UpdateAboutDto) {
    return this.service.updateByLocale(locale, dto);
  }
}
