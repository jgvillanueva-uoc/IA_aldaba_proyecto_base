/**
 * Validates and normalizes required environment variables for app bootstrap.
 */
export interface ValidatedEnv {
  readonly PORT: number;
  readonly DATABASE_URL: string;
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

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(
      'Invalid PORT value. Expected an integer between 1 and 65535.',
    );
  }

  return {
    PORT: port,
    DATABASE_URL: databaseUrl,
  };
}
