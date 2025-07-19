export default () => ({
  port: parseInt(process.env.PORT || '8080', 10),
  baseUrl: process.env.BASE_URL,
  nodeEnv: process.env.NODE_ENV ?? 'development',

  allowedOrigins: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
  allowedHeaders: process.env.ALLOWED_HEADERS || 'Content-Type,Authorization',

  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  jwtRefreshExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,

  mongoUri: process.env.MONGO_URI,
  mongoDatabases: {
    auth: process.env.MONGO_DB_AUTH,
    portfolio: process.env.MONGO_DB_PORTFOLIO,
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER,
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
  },
});
