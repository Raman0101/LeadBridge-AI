import { AIProvider, AIProviderConfig } from './types';
import { logger } from '../../../utils/logger';

/**
 * OpenAI-compatible provider that lazily loads the `openai` package.
 * This allows the application to work without the openai package installed
 * — it only fails if someone actually tries to use the OpenAI provider.
 */
export class OpenAICompatibleProvider implements AIProvider {
  readonly name: string;
  private model: string;
  private maxRetries: number;
  private apiKey: string;
  private baseUrl?: string;

  constructor(config: AIProviderConfig) {
    this.name = `openai:${config.model}`;
    this.model = config.model;
    this.maxRetries = config.maxRetries ?? 3;
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
  }

  private async getClient(): Promise<any> {
    // Dynamic import — the openai package is optional; only needed if this provider is used.
    const openaiPkg = await new Function(
      'return import("openai")'
    )().catch(() => {
      throw new Error(
        'OpenAI package is not installed. Run: npm install openai'
      );
    });
    const OpenAI = openaiPkg.default;
    return new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl,
    });
  }

  async generateContent(
    prompt: string,
    systemPrompt: string,
    options: {
      responseMimeType?: string;
      responseJsonSchema?: Record<string, unknown>;
      temperature?: number;
      maxOutputTokens?: number;
    }
  ): Promise<string> {
    const client = await this.getClient();
    const lastError: Error[] = [];

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        logger.info(`OpenAI call attempt ${attempt + 1}/${this.maxRetries + 1} model=${this.model}`);

        const response = await client.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: options.temperature ?? 0.1,
          max_tokens: options.maxOutputTokens ?? 16384,
          response_format: options.responseJsonSchema
            ? { type: 'json_object' }
            : undefined,
        });

        const content = response.choices?.[0]?.message?.content;
        if (!content) throw new Error('OpenAI returned empty response');

        // Check finish reason for truncation
        const finishReason = response.choices?.[0]?.finish_reason;
        if (finishReason === 'length') {
          throw new Error('OpenAI response was truncated. Consider increasing maxOutputTokens.');
        }

        return content;
      } catch (err) {
        const error = err as Error;
        lastError.push(error);
        const msg = error.message ?? '';

        // Don't retry on auth errors or invalid requests
        if (/401|403|invalid_api_key|insufficient_quota/i.test(msg)) {
          throw error;
        }

        // Check if we should retry (rate limits, timeouts, 5xx, network errors)
        const shouldRetry = /429|rate|timeout|5\d{2}|network|ECONN|empty response|truncated|server error/i.test(msg);
        if (!shouldRetry || attempt === this.maxRetries) {
          throw error;
        }

        const delay = 1000 * Math.pow(2, attempt) + Math.random() * 500;
        logger.warn(`OpenAI attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms`, {
          error: msg,
        });
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    throw lastError[lastError.length - 1];
  }
}