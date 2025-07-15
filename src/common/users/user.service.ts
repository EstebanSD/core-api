import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectAuthModel } from '../helpers';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectAuthModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, isActive: true }).exec();
  }

  async create(data: {
    email: string;
    passwordHash: string;
    fullName?: string;
  }): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    return this.userModel.findByIdAndUpdate(userId, { refreshToken });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }
}
