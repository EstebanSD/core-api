import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(8080),
  BASE_URL: Joi.string().uri().required(),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),
  ALLOWED_HEADERS: Joi.string().default('Content-Type,Authorization'),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().required(),

  MONGO_URI: Joi.string().required(),
  MONGO_DB_AUTH: Joi.string().required(),
  MONGO_DB_PORTFOLIO: Joi.string().required(),

  STORAGE_PROVIDER: Joi.string().valid('local', 'cloudinary', 's3').required(),

  CLOUDINARY_CLOUD_NAME: Joi.string().when('STORAGE_PROVIDER', {
    is: 'cloudinary',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  CLOUDINARY_API_KEY: Joi.string().when('STORAGE_PROVIDER', {
    is: 'cloudinary',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  CLOUDINARY_API_SECRET: Joi.string().when('STORAGE_PROVIDER', {
    is: 'cloudinary',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});
