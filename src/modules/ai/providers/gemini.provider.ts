/**
 * Placeholder provider that represents external Gemini API integration.
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class GeminiProvider {
  /**
   * Returns provider readiness during bootstrap phase.
   * @returns Provider status text.
   */
  public getStatus(): string {
    return 'Gemini provider ready';
  }
}
