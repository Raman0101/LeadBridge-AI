import { AIProvider, AIProviderConfig } from './types';
import { GeminiProvider } from './gemini.provider';
import { logger } from '../../../utils/logger';

let OpenAICompatibleProvider: any = null;

try {
  const mod = require('./openai.provider');
  OpenAICompatibleProvider = mod.OpenAICompatibleProvider;
} catch {
  logger.info('OpenAI provider not available (openai package not installed). Skipping.');
}

export type { AIProvider, AIProviderConfig } from './types';

export function createProvider(config: AIProviderConfig): AIProvider {
  switch (config.name.toLowerCase()) {
    case 'gemini':
      return new GeminiProvider(config);
    case 'openai':
    case 'openai-compatible':
      if (OpenAICompatibleProvider) {
        return new OpenAICompatibleProvider(config);
      }
      throw new Error(
        'OpenAI provider is not available. Install the openai package: npm install openai'
      );
    default:
      throw new Error(`Unknown AI provider: ${config.name}. Supported: gemini, openai`);
  }
}

export function isProviderAvailable(name: string): boolean {
  if (name.toLowerCase() === 'openai' || name.toLowerCase() === 'openai-compatible') {
    return OpenAICompatibleProvider !== null;
  }
  return true; // Gemini is always available if package is installed
}