import { GoogleGenAI } from '@google/genai';
import { AIProvider, AIProviderConfig } from './types';
import { logger } from '../../../utils/logger';

export class GeminiProvider implements AIProvider {
  readonly name: string;
  private client: GoogleGenAI;
  private model: string;
  private maxRetries: number;

  constructor(config: AIProviderConfig) {
    this.name = `gemini:${config.model}`;
    this.model = config.model;
    this.maxRetries = config.maxRetries ?? 3;
    this.client = new GoogleGenAI({ apiKey: config.apiKey });
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
    const lastError: Error[] = [];

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        logger.info(`Gemini call attempt ${attempt + 1}/${this.maxRetries + 1} model=${this.model}`);

        const response = await this.client.models.generateContent({
          model: this.model,
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: options.responseMimeType,
            responseJsonSchema: options.responseJsonSchema,
            temperature: options.temperature ?? 0.1,
            maxOutputTokens: options.maxOutputTokens ?? 16384,
          },
        });

        const content = response.text;
        if (!content) throw new Error('Gemini returned empty response');

        // Check finish reason for truncation
        const finishReason = response.candidates?.[0]?.finishReason;
        if (finishReason === 'MAX_TOKENS') {
          throw new Error('Gemini response was truncated. Consider increasing maxOutputTokens.');
        }

        return content;
      } catch (err) {
        const error = err as Error;
        lastError.push(error);
        const msg = error.message ?? '';

        // Don't retry on JSON parse errors or invalid argument errors
        if (/invalid JSON|SAFETY|INVALID_ARGUMENT/i.test(msg)) {
          throw error;
        }

        // Check if we should retry (rate limits, timeouts, 5xx, network errors)
        const shouldRetry = /rate|timeout|5\d{2}|network|ECONN|empty response|truncated/i.test(msg);
        if (!shouldRetry || attempt === this.maxRetries) {
          throw error;
        }

        const delay = 1000 * Math.pow(2, attempt) + Math.random() * 500;
        logger.warn(`Gemini attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms`, {
          error: msg,
        });
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    throw lastError[lastError.length - 1];
  }
}