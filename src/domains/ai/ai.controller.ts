import { Throttle } from '@nestjs/throttler';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { GenerateSummaryUseCase } from './application/use-cases';
import { AIMetricsService } from './infrastructure/metrics/ai-metrics.service';

@Controller('ai')
@Throttle({ default: { limit: 10, ttl: 60_000 } })
export class AiController {
  constructor(
    private readonly summary: GenerateSummaryUseCase,
    private readonly metricsService: AIMetricsService,
  ) {}

  @Post('summary')
  async summaryText(@Body('content') content: string) {
    return this.summary.execute(content);
  }

  @Get('metrics')
  getMetrics() {
    return this.metricsService.getMetrics();
  }
}
