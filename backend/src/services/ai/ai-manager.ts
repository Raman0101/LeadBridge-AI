import { AIProvider, AIProviderConfig, ProviderFallbackResult } from './providers/types';
import { createProvider, isProviderAvailable } from './providers';
import { logger } from '../../utils/logger';

export interface AIManagerConfig {
  /** Ordered list of provider configurations to try */
  providers: AIProviderConfig[];
  /** Whether to fail over to next provider on error */
  enableFallback: boolean;
}

/**
 * AI Manager that supports multiple models/providers with automatic fallback.
 *
 * Config via environment:
 *   GEMINI_API_KEY=...
 *   GEMINI_MODELS=gemini-2.0-flash,gemini-2.5-flash,gemini-3.5-flash
 *   OPENAI_API_KEY=...               (optional)
 *   OPENAI_MODEL=gpt-4o              (optional)
 *   AI_FALLBACK=true                 (default: true)
 */
export class AIManager {
  private providerInstances: AIProvider[] = [];
  private config: AIManagerConfig;

  constructor(config?: Partial<AIManagerConfig>) {
    this.config = {
      providers: [],
      enableFallback: true,
      ...config,
    };

    if (this.config.providers.length === 0) {
      this.config.providers = this.loadProvidersFromEnv();
    }

    this.initializeProviders();
  }

  private loadProvidersFromEnv(): AIProviderConfig[] {
    const providers: AIProviderConfig[] = [];
    const apiKey = process.env.GEMINI_API_KEY;
    const maxTokens = parseInt(process.env.AI_MAX_OUTPUT_TOKENS || '16384', 10);
    const temperature = parseFloat(process.env.AI_TEMPERATURE || '0.1');

    if (!apiKey) {
      logger.warn('GEMINI_API_KEY not set — no AI provider available');
      return providers;
    }

    // Load multiple Gemini models from GEMINI_MODELS env var
    const geminiModels = (process.env.GEMINI_MODELS || 'gemini-2.0-flash')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    for (const model of geminiModels) {
      providers.push({
        name: 'gemini',
        model,
        apiKey,
        maxOutputTokens: maxTokens,
        temperature,
      });
      logger.info(`Registered Gemini model: ${model}`);
    }

    // Optional OpenAI provider as additional fallback
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      providers.push({
        name: 'openai',
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        apiKey: openaiKey,
        baseUrl: process.env.OPENAI_BASE_URL,
        maxOutputTokens: maxTokens,
        temperature,
      });
      logger.info('Registered OpenAI provider');
    }

    return providers;
  }

  private initializeProviders(): void {
    for (const config of this.config.providers) {
      try {
        if (config.name.toLowerCase() !== 'gemini' && !isProviderAvailable(config.name)) {
          logger.warn(`Provider "${config.name}" is not available (package not installed). Skipping.`);
          continue;
        }
        const instance = createProvider(config);
        this.providerInstances.push(instance);
        logger.info(`Initialized AI provider: ${instance.name}`);
      } catch (err) {
        logger.error(`Failed to initialize provider "${config.name}": ${(err as Error).message}`);
      }
    }

    if (this.providerInstances.length === 0) {
      throw new Error(
        'No AI providers available. Configure at least one provider via environment variables.'
      );
    }

    logger.info(`AI Manager ready with ${this.providerInstances.length} model(s): ${
      this.providerInstances.map(p => p.name).join(' → ')
    }`);
  }

  async generateContent(
    prompt: string,
    systemPrompt: string,
    options: {
      responseMimeType?: string;
      responseJsonSchema?: Record<string, unknown>;
      temperature?: number;
      maxOutputTokens?: number;
    } = {}
  ): Promise<ProviderFallbackResult> {
    const errors: { provider: string; error: string }[] = [];

    for (const provider of this.providerInstances) {
      try {
        logger.info(`Attempting generation with: ${provider.name}`);
        const content = await provider.generateContent(prompt, systemPrompt, options);
        logger.info(`Success with: ${provider.name}`);
        return { content, provider: provider.name, model: provider.name };
      } catch (err) {
        const error = err as Error;
        const errorMsg = error.message;
        errors.push({ provider: provider.name, error: errorMsg });
        logger.warn(`${provider.name} failed: ${errorMsg}`);

        if (!this.config.enableFallback) {
          throw new Error(
            `[${provider.name}] ${errorMsg}` +
            (errors.length > 1 ? `\nPrevious errors: ${errors.slice(0, -1).map(e => `[${e.provider}] ${e.error}`).join('; ')}` : '')
          );
        }

        // If this is the last provider, throw with all errors
        if (provider === this.providerInstances[this.providerInstances.length - 1]) {
          const allErrors = errors.map(e => `[${e.provider}] ${e.error}`).join('; ');
          throw new Error(`All models/providers failed: ${allErrors}`);
        }

        logger.info(`Falling back to next model...`);
      }
    }

    throw new Error('No providers available to generate content');
  }

  get availableProviders(): string[] {
    return this.providerInstances.map(p => p.name);
  }
}