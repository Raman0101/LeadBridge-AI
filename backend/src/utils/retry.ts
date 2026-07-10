import { logger } from './logger';

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  shouldRetry?: (err: unknown) => boolean;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 1000, shouldRetry = () => true } = opts;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries || !shouldRetry(err)) break;

      const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 250;
      logger.warn(`Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms`, {
        error: (err as Error)?.message,
      });
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}