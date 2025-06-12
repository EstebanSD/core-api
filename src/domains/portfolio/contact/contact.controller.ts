import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactDto } from './dtos';
import { Auth, Roles } from 'src/common/decorators';

@Controller('portfolio/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  async get() {
    return this.contactService.get();
  }

  @Auth()
  @Roles('Admin')
  @Post()
  async create(@Body() body: CreateContactDto) {
    return this.contactService.create(body);
  }

  @Auth()
  @Roles('Admin')
  @Patch()
  async update(@Body() body: UpdateContactDto) {
    return this.contactService.update(body);
  }

  @Auth()
  @Roles('Admin')
  @Delete()
  async delete() {
    return this.contactService.delete();
  }
}
