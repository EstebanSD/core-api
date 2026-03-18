import { Injectable } from '@nestjs/common';
import { generateText, streamText } from 'ai';
import { AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { AIProvider } from '../../domain/ai-provider.interface';
import type { AITextRequest } from '../../domain/prompt-input';
import type { AIStreamChunk, AITextResponse } from '../../domain/ai-response';
import { AIProviderError } from '../../domain/errors/ai-provider.error';

@Injectable()
export class VercelProvider implements AIProvider {
  private readonly model: string;

  constructor(
    private readonly configService: AppConfigService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('VercelProvider');
    this.model = this.configService.aiModel;
  }

  async generateText(input: AITextRequest): Promise<AITextResponse> {
    try {
      const { text, usage } = await generateText({
        model: this.model,
        prompt: input.prompt,
        maxOutputTokens: input.maxTokens ?? 256,
        temperature: input.temperature ?? 0.3,
      });

      const result: AITextResponse = {
        text,
        provider: 'vercel',
        model: this.model,
        usage: {
          inputTokens: usage.inputTokens || 0,
          outputTokens: usage.outputTokens || 0,
          totalTokens: usage.totalTokens || 0,
        },
      };
      return result;
    } catch (error: unknown) {
      this.logger.error('AI request generate text failed', error);
      throw new AIProviderError('Failed to generate text', 'vercel', error);
    }
  }

  async *streamText(input: AITextRequest): AsyncIterable<AIStreamChunk> {
    try {
      const { textStream } = streamText({
        model: this.model,
        prompt: input.prompt,
        maxOutputTokens: input.maxTokens ?? 256,
        temperature: input.temperature ?? 0.3,
      });

      for await (const delta of textStream) {
        yield { delta };
      }

      yield {
        delta: '',
        done: true,
      };
    } catch (error: unknown) {
      this.logger.error('AI request stream text failed', error);
      throw new AIProviderError('Failed to stream text', 'vercel', error);
    }
  }
}
