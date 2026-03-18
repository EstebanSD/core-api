import { Injectable } from '@nestjs/common';

interface TaskMetrics {
  totalRequests: number;
  totalErrors: number;
  totalLatencyMs: number;
  cacheHits: number;
}

@Injectable()
export class AIMetricsService {
  private readonly metrics = new Map<string, TaskMetrics>();

  recordRequest(task: string) {
    const m = this.ensure(task);
    m.totalRequests++;
  }

  recordError(task: string) {
    const m = this.ensure(task);
    m.totalErrors++;
  }

  recordLatency(task: string, latencyMs: number) {
    const m = this.ensure(task);
    m.totalLatencyMs += latencyMs;
  }

  recordCacheHit(task: string) {
    const m = this.ensure(task);
    m.cacheHits++;
  }

  getMetrics() {
    return Array.from(this.metrics.entries()).map(([task, m]) => ({
      task,
      ...m,
      avgLatencyMs: m.totalRequests > 0 ? m.totalLatencyMs / m.totalRequests : 0,
      errorRate: m.totalRequests > 0 ? m.totalErrors / m.totalRequests : 0,
      cacheHitRate: m.totalRequests > 0 ? m.cacheHits / m.totalRequests : 0,
    }));
  }

  private ensure(task: string): TaskMetrics {
    if (!this.metrics.has(task)) {
      this.metrics.set(task, {
        totalRequests: 0,
        totalErrors: 0,
        totalLatencyMs: 0,
        cacheHits: 0,
      });
    }
    return this.metrics.get(task)!;
  }
}
