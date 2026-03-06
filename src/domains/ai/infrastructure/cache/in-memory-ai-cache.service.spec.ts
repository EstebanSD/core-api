import { InMemoryAICacheService } from './in-memory-ai-cache.service';
import type { AITextResponse } from '../../domain/ai-response';

describe('InMemoryAICacheService', () => {
  let cache: InMemoryAICacheService;

  const mockResponse: AITextResponse = {
    text: 'test result',
    provider: 'ollama',
    model: 'test-model',
    // usage: 10, TODO
    // latencyMs: 5, TODO
  };

  beforeEach(() => {
    cache = new InMemoryAICacheService();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return stored value before TTL expires', () => {
    cache.set('key', mockResponse, 1000);

    const result = cache.get('key');

    expect(result).toEqual(mockResponse);
  });

  it('should return undefined after TTL expires', () => {
    cache.set('key', mockResponse, 1000);

    jest.advanceTimersByTime(1001);

    const result = cache.get('key');

    expect(result).toBeUndefined();
  });

  it('should delete expired entry after access', () => {
    cache.set('key', mockResponse, 1000);

    jest.advanceTimersByTime(1001);

    cache.get('key');

    expect(cache.get('key')).toBeUndefined();
  });

  it('clear() should remove all entries', () => {
    cache.set('key1', mockResponse, 1000);
    cache.set('key2', mockResponse, 1000);

    cache.clear();

    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
  });
});
