import { Controller, Get } from '@nestjs/common';
import { AIMetricsService } from './infrastructure/metrics/ai-metrics.service';

@Controller('ai-metrics')
export class AIMetricsController {
  constructor(private readonly metrics: AIMetricsService) {}

  @Get()
  get() {
    return this.metrics.getMetrics();
  }
}
