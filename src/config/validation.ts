import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(8080),
  BASE_URL: Joi.string().uri().required(),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),
  ALLOWED_HEADERS: Joi.string().default('Content-Type,Authorization'),

  BCRYPT_SALT_ROUNDS: Joi.number().default(10),
  JWT_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.number().required(),
  JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.number().required(),

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

  RUN_AI_TESTS: Joi.string().default('false'),

  AI_PROVIDER: Joi.string().valid('mock', 'ollama', 'open-router', 'vercel').default('mock'),
  AI_API_KEY: Joi.string().required(),
  AI_MODEL: Joi.string().default('llama3'),
  AI_BASE_URL: Joi.string().default('http://localhost:11434/v1'),
  AI_GATEWAY_API_KEY: Joi.string().when('AI_PROVIDER', {
    is: 'vercel',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});
