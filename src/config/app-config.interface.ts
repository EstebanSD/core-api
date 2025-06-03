export interface AppConfig {
  port: number;
  baseUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
  mongoUri: string;
  mongoDatabases: {
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
