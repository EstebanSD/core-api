import { ConflictException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectPortfolioModel, pickDefined } from 'src/common/helpers';
import { Contact, ContactDocument } from './schemas/contact.schema';
import { CreateContactDto, UpdateContactDto } from './dtos';

@Injectable()
export class ContactService {
  constructor(
    @InjectPortfolioModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
  ) {}

  async get(): Promise<Contact | null> {
    return await this.contactModel.findOne().lean().exec();
  }

  async create(body: CreateContactDto): Promise<Contact> {
    const exists = await this.contactModel.findOne().lean().exec();
    if (exists) {
      throw new ConflictException('Contact already exists');
    }
    const contact = await this.contactModel.create(body);
    return contact.toObject();
  }

  async update(body: UpdateContactDto): Promise<Contact> {
    const contact = await this.contactModel.findOne().exec();
    if (!contact) {
      throw new ConflictException('Contact information not found');
    }

    Object.assign(contact, pickDefined(body, ['email', 'phone', 'socialLinks']));
    await contact.save();

    return contact.toObject();
  }

  async delete(): Promise<void> {
    await this.contactModel.findOneAndDelete();
  }
}
