/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerModule } from 'src/common/logger/custom-logger.module';
import { AiModule } from 'src/domains/ai/ai.module';
import { GenerateSummaryUseCase } from 'src/domains/ai/application/use-cases';
import { AI_PROVIDER } from 'src/domains/ai/domain/ai.tokens';
import { CacheAIProvider } from 'src/domains/ai/infrastructure/providers/cache.provider';
import { MetricsAIProvider } from 'src/domains/ai/infrastructure/providers/metrics.provider';
import { MockProvider } from 'src/domains/ai/infrastructure/providers/mock.provider';

describe('AiModule Integration', () => {
  let module: TestingModule;
  let summaryUseCase: GenerateSummaryUseCase;

  beforeAll(async () => {
    process.env.AI_PROVIDER = 'mock';

    module = await Test.createTestingModule({
      imports: [AiModule, CustomLoggerModule],
    }).compile();

    summaryUseCase = module.get(GenerateSummaryUseCase);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should resolve GenerateSummaryUseCase', () => {
    expect(summaryUseCase).toBeDefined();
  });

  it('should wire AI provider pipeline correctly', () => {
    const provider = module.get(AI_PROVIDER);

    expect(provider).toBeInstanceOf(CacheAIProvider);

    const metricsProvider = (provider as CacheAIProvider)['provider'];
    expect(metricsProvider).toBeInstanceOf(MetricsAIProvider);

    const baseProvider = (metricsProvider as MetricsAIProvider)['provider'];
    expect(baseProvider).toBeInstanceOf(MockProvider);
  });

  it('should execute summary using MockProvider', async () => {
    const result = await summaryUseCase.execute('Test content');

    expect(result).toBeDefined();
    expect(result.provider).toBe('mock');
    expect(result.text).toContain('Mock');
  });
});
