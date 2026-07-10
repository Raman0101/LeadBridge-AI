export interface AIProviderConfig {
  name: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
  maxRetries?: number;
  maxOutputTokens?: number;
  temperature?: number;
}

export interface AIProvider {
  readonly name: string;
  generateContent(prompt: string, systemPrompt: string, options: {
    responseMimeType?: string;
    responseJsonSchema?: Record<string, unknown>;
    temperature?: number;
    maxOutputTokens?: number;
  }): Promise<string>;
}

export interface ProviderFallbackResult {
  content: string;
  provider: string;
  model: string;
}