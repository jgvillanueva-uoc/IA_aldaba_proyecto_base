/**
 * Validates and normalizes required environment variables for app bootstrap.
 */
export interface ValidatedEnv {
  readonly PORT: number;
  readonly DATABASE_URL: string;
  readonly GEMINI_API_KEY?: string;
  readonly GEMINI_MODEL: string;
  readonly AI_TIMEOUT_MS: number;
}

/**
 * Validates process environment values.
 * @param env Input key/value map from process.env.
 * @returns Strongly-typed environment object used by the app.
 * @throws Error when required values are invalid.
 */
export function validateEnv(env: NodeJS.ProcessEnv): ValidatedEnv {
  const portRaw: string = env.PORT ?? '3000';
  const port: number = Number(portRaw);
  const databaseUrl: string = env.DATABASE_URL ?? 'file:./dev.db';
  const geminiApiKey: string | undefined =
    env.GEMINI_API_KEY?.trim() || undefined;
  const geminiModel: string = env.GEMINI_MODEL?.trim() || 'gemini-1.5-flash';
  const aiTimeoutRaw: string = env.AI_TIMEOUT_MS ?? '8000';
  const aiTimeoutMs: number = Number(aiTimeoutRaw);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(
      'Invalid PORT value. Expected an integer between 1 and 65535.',
    );
  }

  if (!Number.isInteger(aiTimeoutMs) || aiTimeoutMs <= 0) {
    throw new Error(
      'Invalid AI_TIMEOUT_MS value. Expected a positive integer.',
    );
  }

  return {
    PORT: port,
    DATABASE_URL: databaseUrl,
    GEMINI_API_KEY: geminiApiKey,
    GEMINI_MODEL: geminiModel,
    AI_TIMEOUT_MS: aiTimeoutMs,
  };
}
