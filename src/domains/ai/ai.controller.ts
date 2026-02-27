import { Body, Controller, Post } from '@nestjs/common';
import { GenerateSummaryUseCase } from './application/use-cases';

@Controller('ai-test')
export class AiTestController {
  constructor(private readonly summary: GenerateSummaryUseCase) {}

  @Post('summary')
  async summaryText(@Body('content') content: string) {
    return this.summary.execute(content);
  }
}
