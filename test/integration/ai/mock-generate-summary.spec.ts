import { Test, TestingModule } from '@nestjs/testing';
import { AiModule } from 'src/domains/ai/ai.module';
import { CustomLoggerModule } from 'src/common/logger/custom-logger.module';
import { GenerateSummaryUseCase } from 'src/domains/ai/application/use-cases';

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

  it('should resolve GenerateSummaryUseCase', () => {
    expect(summaryUseCase).toBeDefined();
  });

  it('should execute with MockProvider', async () => {
    const result = await summaryUseCase.execute('Test content');

    expect(result.provider).toBe('mock');
    expect(result.result).toContain('Mock');
  });
});
