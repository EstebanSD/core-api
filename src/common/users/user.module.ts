import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { DB_CONNECTIONS } from '../constants';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }], DB_CONNECTIONS.AUTH),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
