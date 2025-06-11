import { InjectModel as MongooseInjectModel } from '@nestjs/mongoose';
import { DB_CONNECTIONS } from '../constants/db-connections';

export const InjectPortfolioModel = (modelName: string) =>
  MongooseInjectModel(modelName, DB_CONNECTIONS.PORTFOLIO);

export const InjectAuthModel = (modelName: string) =>
  MongooseInjectModel(modelName, DB_CONNECTIONS.AUTH);
