import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './app-config.interface';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  get isProduction(): boolean {
    return this.config.get('nodeEnv') === 'production';
  }

  get port(): number {
    return this.config.getOrThrow('port');
  }

  get baseUrl(): string {
    return this.config.getOrThrow('baseUrl');
  }

  get apiUrl(): string {
    return `${this.baseUrl}/api`;
  }

  get mongoUri(): string {
    return this.config.getOrThrow('mongoUri');
  }

  get portfolioDb(): AppConfig['mongoDatabases']['portfolio'] {
    const { portfolio } = this.config.getOrThrow<AppConfig['mongoDatabases']>('mongoDatabases');
    return portfolio;
  }

  get storageProvider(): AppConfig['storage']['provider'] {
    const { provider } = this.config.getOrThrow<AppConfig['storage']>('storage');
    return provider;
  }

  get cloudinaryConfig(): AppConfig['storage']['cloudinary'] {
    const { cloudinary } = this.config.getOrThrow<AppConfig['storage']>('storage');
    return cloudinary;
  }
}
