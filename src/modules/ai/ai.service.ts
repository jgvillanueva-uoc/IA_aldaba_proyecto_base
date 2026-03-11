/**
 * Handles AI estimation integration orchestration.
 */
import { Injectable } from '@nestjs/common';
import { GeminiProvider } from './providers/gemini.provider';

@Injectable()
export class AiService {
  /**
   * Injects the external AI provider adapter.
   * @param geminiProvider Provider used for remote AI communication.
   */
  public constructor(private readonly geminiProvider: GeminiProvider) {}

  /**
   * Returns AI module bootstrap status.
   * @returns Informational message from provider adapter.
   */
  public getModuleStatus(): string {
    return this.geminiProvider.getStatus();
  }
}
