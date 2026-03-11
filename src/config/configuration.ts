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
  };
}
