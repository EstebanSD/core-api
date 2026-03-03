import { Body, Controller, Post } from '@nestjs/common';
import { GenerateSummaryUseCase } from './application/use-cases';

@Controller('ai')
export class AiController {
  constructor(private readonly summary: GenerateSummaryUseCase) {}

  @Post('summary')
  async summaryText(@Body('content') content: string) {
    return this.summary.execute(content);
  }
}
