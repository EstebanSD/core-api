import { Test, TestingModule } from '@nestjs/testing';
import { AiModule } from 'src/domains/ai/ai.module';
import { GenerateSummaryUseCase } from 'src/domains/ai/application/use-cases';

describe('AiModule Integration', () => {
  let module: TestingModule;
  let summaryUseCase: GenerateSummaryUseCase;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AiModule],
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
