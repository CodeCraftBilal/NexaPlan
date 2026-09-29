import { HttpError } from "../utils/httpError.js";

export interface AIProvider {
  generateText(prompt: string): Promise<string>;
}

export function hasAPIKey(key: string | undefined): key is string {
  return Boolean(key?.trim() && !/^your-.*api-key-here$/i.test(key.trim()));
}

export function requireAPIKey(
  key: string | undefined,
  provider: string,
): string {
  if (!hasAPIKey(key)) {
    throw new HttpError(
      503,
      `AI features are not configured yet. Add a ${provider} API key to enable them.`,
    );
  }
  return key;
}
