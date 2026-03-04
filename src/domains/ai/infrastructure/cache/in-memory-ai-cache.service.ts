import { Injectable, Scope } from '@nestjs/common';
import type { AIResponse } from '../../domain/ai-response';

interface CacheEntry {
  value: AIResponse;
  expiresAt: number;
}

@Injectable({ scope: Scope.DEFAULT })
export class InMemoryAICacheService {
  private readonly store = new Map<string, CacheEntry>();

  get(key: string): AIResponse | undefined {
    const entry = this.store.get(key);

    if (!entry) return undefined;

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: AIResponse, ttlMs: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  clear(): void {
    this.store.clear();
  }
}
