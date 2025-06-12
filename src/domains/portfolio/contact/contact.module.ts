import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactSchema } from './schemas/contact.schema';
import { DB_CONNECTIONS } from 'src/common/constants';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Contact.name, schema: ContactSchema }],
      DB_CONNECTIONS.PORTFOLIO,
    ),
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
