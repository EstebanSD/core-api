import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { AIProvider } from 'src/domains/ai/domain/ai-provider.interface';
import type { AITextRequest } from 'src/domains/ai/domain/prompt-input';
import type { AIResponse } from 'src/domains/ai/domain/ai-response';
import { AIProviderError } from 'src/domains/ai/domain/errors/ai-provider.error';

@Injectable()
export class OllamaProvider implements AIProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(
    private readonly configService: AppConfigService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('OllamaProvider');

    this.model = this.configService.aiModel;

    this.client = new OpenAI({
      apiKey: this.configService.aiApiKey,
      baseURL: this.configService.ollamaBaseUrl,
    });
  }

  async generateText(input: AITextRequest): Promise<AIResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: input.prompt }],
        max_tokens: input.maxTokens ?? 256,
      });

      const result: AIResponse = {
        text: completion.choices[0].message.content ?? '',
        provider: 'ollama',
        model: this.model,
        usage: {
          inputTokens: completion.usage?.prompt_tokens || 0,
          outputTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
      };

      return result;
    } catch (error: unknown) {
      this.logger.error('AI request generate text failed', error);
      throw new AIProviderError('Failed to generate text', 'ollama', error);
    }
  }
}
