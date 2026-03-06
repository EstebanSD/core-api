export interface AppConfig {
  port: number;
  baseUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
  allowedOrigins: string[];
  allowedHeaders: string[];
  bcryptSaltRounds: number;
  jwtSecret: string;
  jwtAccessExpiration: number;
  jwtRefreshExpiration: number;
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
  // runAiTests: string; integrations
  ai: {
    provider: 'mock' | 'ollama' | 'openai';
    model: string;
    apiKey: string;
    ollamaBaseUrl: string;
  };
}
