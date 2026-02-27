import { AppConfigService } from 'src/config';
import { AIProvider } from '../domain/ai-provider.interface';
import { MockProvider } from './providers/mock.provider';

export function aiProviderFactory(config: AppConfigService): AIProvider {
  const providerType = config.aiProvider;

  switch (providerType) {
    case 'mock':
    default:
      return new MockProvider();
  }
}
