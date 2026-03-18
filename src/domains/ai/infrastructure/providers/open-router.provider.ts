import { Injectable } from '@nestjs/common';
import { OpenRouter } from '@openrouter/sdk';
import { AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { AIProvider } from 'src/domains/ai/domain/ai-provider.interface';
import type { AITextRequest } from 'src/domains/ai/domain/prompt-input';
import type { AIStreamChunk, AITextResponse } from 'src/domains/ai/domain/ai-response';
import { AIProviderError } from 'src/domains/ai/domain/errors/ai-provider.error';

@Injectable()
export class OpenRouterProvider implements AIProvider {
  private readonly client: OpenRouter;
  private readonly model: string;

  constructor(
    private readonly configService: AppConfigService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('OpenRouterProvider');

    this.model = this.configService.aiModel;

    this.client = new OpenRouter({
      apiKey: this.configService.aiApiKey,
    });
  }

  async generateText(input: AITextRequest): Promise<AITextResponse> {
    try {
      const completion = await this.client.chat.send({
        chatGenerationParams: {
          model: this.model,
          messages: [{ role: 'user', content: input.prompt }],
          maxTokens: input.maxTokens ?? 256,
          temperature: input.temperature ?? 0.3,
          stream: false,
        },
      });

      const result: AITextResponse = {
        text: completion.choices[0].message.content as string,
        provider: 'Open Router',
        model: this.model,
        usage: {
          inputTokens: completion.usage?.promptTokens || 0,
          outputTokens: completion.usage?.completionTokens || 0,
          totalTokens: completion.usage?.totalTokens || 0,
        },
      };

      return result;
    } catch (error: unknown) {
      this.logger.error('AI request generate text failed', error);
      throw new AIProviderError('Failed to generate text', 'open-router', error);
    }
  }

  async *streamText(input: AITextRequest): AsyncIterable<AIStreamChunk> {
    try {
      const stream = await this.client.chat.send({
        chatGenerationParams: {
          model: this.model,
          messages: [{ role: 'user', content: input.prompt }],
          maxTokens: input.maxTokens ?? 256,
          temperature: input.temperature ?? 0.3,
          stream: true,
        },
      });

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content;

        if (delta) {
          yield {
            delta,
          };
        }

        if (chunk.choices?.[0]?.finishReason) {
          yield {
            delta: '',
            done: true,
          };
        }
      }
    } catch (error: unknown) {
      this.logger.error('AI request stream text failed', error);

      throw new AIProviderError('Failed to stream text', 'open-router', error);
    }
  }
}
