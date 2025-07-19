export interface AppConfig {
  port: number;
  baseUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
  allowedOrigins: string[];
  allowedHeaders: string[];
  jwtSecret: string;
  jwtExpiration: string;
  mongoUri: string;
  mongoDatabases: {
    auth: string;
    portfolio: string;
  };
  storage: {
    provider: 'local' | 'cloudinary' | 's3';
    cloudinary: {
      cloudName: string;
      apiKey: string;
      apiSecret: string;
    };
  };
}
