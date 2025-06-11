export default () => ({
  port: parseInt(process.env.PORT || '8080', 10),
  baseUrl: process.env.BASE_URL,
  nodeEnv: process.env.NODE_ENV ?? 'development',

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION,

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
