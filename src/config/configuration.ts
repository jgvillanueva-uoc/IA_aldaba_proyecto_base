/**
 * Builds application runtime configuration from validated environment values.
 */
import { validateEnv } from './env.validation';

export interface AppConfiguration {
  readonly app: {
    readonly port: number;
  };
  readonly persistence: {
    readonly databaseUrl: string;
  };
  readonly ai: {
    readonly geminiApiKey?: string;
    readonly geminiModel: string;
    readonly timeoutMs: number;
  };
}

/**
 * Creates application configuration object.
 * @returns Typed configuration consumed by bootstrap and modules.
 */
export function configuration(): AppConfiguration {
  const env = validateEnv(process.env);

  return {
    app: {
      port: env.PORT,
    },
    persistence: {
      databaseUrl: env.DATABASE_URL,
    },
    ai: {
      geminiApiKey: env.GEMINI_API_KEY,
      geminiModel: env.GEMINI_MODEL,
      timeoutMs: env.AI_TIMEOUT_MS,
    },
  };
}
