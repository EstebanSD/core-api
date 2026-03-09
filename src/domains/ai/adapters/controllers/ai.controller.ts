import { Throttle } from '@nestjs/throttler';
import { Observable } from 'rxjs';
import { Body, Controller, Get, Post, Sse, MessageEvent, Query } from '@nestjs/common';
import { AIMetricsService } from '../../infrastructure/metrics/ai-metrics.service';
import {
  ClassificationStreamUseCase,
  ClassifyContentUseCase,
  ExtractKeywordsUseCase,
  GenerateSeoMetaUseCase,
  GenerateSummaryUseCase,
  KeywordsStreamUseCase,
  SeoMetaStreamUseCase,
  SummaryStreamUseCase,
} from '../../application/use-cases';
import { streamToObservable } from '../utils';
import {
  ClassifyDto,
  ClassifyStreamDto,
  KeywordsDto,
  KeywordsStreamDto,
  SeoMetaDto,
  SeoMetaStreamDto,
  SummaryDto,
  SummaryStreamDto,
} from '../dtos';

@Controller('ai')
@Throttle({ default: { limit: 10, ttl: 60_000 } })
export class AiController {
  constructor(
    private readonly generateClassify: ClassifyContentUseCase,
    private readonly generateKeywords: ExtractKeywordsUseCase,
    private readonly generateSeoMeta: GenerateSeoMetaUseCase,
    private readonly generateSummary: GenerateSummaryUseCase,

    private readonly classificationStream: ClassificationStreamUseCase,
    private readonly keywordsStream: KeywordsStreamUseCase,
    private readonly seoMetaStream: SeoMetaStreamUseCase,
    private readonly summaryStream: SummaryStreamUseCase,

    private readonly metricsService: AIMetricsService,
  ) {}

  @Post('classify')
  async classifyText(@Body() body: ClassifyDto) {
    return this.generateClassify.execute(body.content, body.categories);
  }

  @Sse('classify/stream')
  classify(@Query() query: ClassifyStreamDto): Observable<MessageEvent> {
    const categories = query.categories.split(',');

    const stream = this.classificationStream.execute(query.content, categories);
    return streamToObservable(stream);
  }

  @Post('keywords')
  async keywordsText(@Body() body: KeywordsDto) {
    return this.generateKeywords.execute(body.content, body.limit);
  }

  @Sse('keywords/stream')
  keywords(@Query() query: KeywordsStreamDto): Observable<MessageEvent> {
    const limit = parseInt(query.limit || '10');

    const stream = this.keywordsStream.execute(query.content, limit);
    return streamToObservable(stream);
  }

  @Post('seo-meta')
  async seoMetaText(@Body() body: SeoMetaDto) {
    return this.generateSeoMeta.execute(body.content);
  }

  @Sse('seo-meta/stream')
  seoMeta(@Query() query: SeoMetaStreamDto): Observable<MessageEvent> {
    const stream = this.seoMetaStream.execute(query.content);
    return streamToObservable(stream);
  }

  @Post('summary')
  async summaryText(@Body() body: SummaryDto) {
    return this.generateSummary.execute(body.content);
  }

  @Sse('summary/stream')
  summary(@Query() query: SummaryStreamDto): Observable<MessageEvent> {
    const stream = this.summaryStream.execute(query.content);
    return streamToObservable(stream);
  }

  @Get('metrics')
  getMetrics() {
    return this.metricsService.getMetrics();
  }
}
