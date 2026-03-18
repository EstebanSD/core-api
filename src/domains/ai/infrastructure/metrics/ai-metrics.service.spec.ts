import { AIMetricsService } from './ai-metrics.service';

describe('AIMetricsService', () => {
  let service: AIMetricsService;

  beforeEach(() => {
    service = new AIMetricsService();
  });

  it('should initialize metrics for a new task', () => {
    service.recordRequest('taskA');

    const metrics = service.getMetrics();

    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toMatchObject({
      task: 'taskA',
      totalRequests: 1,
      totalErrors: 0,
      totalLatencyMs: 0,
      cacheHits: 0,
      avgLatencyMs: 0,
      errorRate: 0,
      cacheHitRate: 0,
    });
  });

  it('should correctly accumulate metrics', () => {
    service.recordRequest('taskA');
    service.recordRequest('taskA');
    service.recordError('taskA');
    service.recordLatency('taskA', 100);
    service.recordLatency('taskA', 200);
    service.recordCacheHit('taskA');

    const [metrics] = service.getMetrics();

    expect(metrics.totalRequests).toBe(2);
    expect(metrics.totalErrors).toBe(1);
    expect(metrics.totalLatencyMs).toBe(300);
    expect(metrics.cacheHits).toBe(1);
  });

  it('should calculate derived values correctly', () => {
    service.recordRequest('taskA');
    service.recordRequest('taskA');
    service.recordError('taskA');
    service.recordLatency('taskA', 100);
    service.recordLatency('taskA', 100);
    service.recordCacheHit('taskA');

    const [metrics] = service.getMetrics();

    expect(metrics.avgLatencyMs).toBe(100); // 200 / 2
    expect(metrics.errorRate).toBe(0.5); // 1 / 2
    expect(metrics.cacheHitRate).toBe(0.5); // 1 / 2
  });

  it('should return 0 for derived values when no requests', () => {
    service.recordError('taskA'); // no request recorded

    const [metrics] = service.getMetrics();

    expect(metrics.avgLatencyMs).toBe(0);
    expect(metrics.errorRate).toBe(0);
    expect(metrics.cacheHitRate).toBe(0);
  });
});
