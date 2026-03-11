/**
 * Builds application runtime configuration from validated environment values.
 */
import { validateEnv } from './env.validation';

export interface AppConfiguration {
  readonly app: {
    readonly port: number;
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
  };
}
