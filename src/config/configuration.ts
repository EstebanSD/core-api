export default () => ({
  port: parseInt(process.env.PORT || '8080', 10),
  mongoUri: process.env.MONGO_URI,
  mongoDatabases: {
    portfolio: process.env.MONGO_DB_PORTFOLIO,
  },
  nodeEnv: process.env.NODE_ENV ?? 'development',
});
