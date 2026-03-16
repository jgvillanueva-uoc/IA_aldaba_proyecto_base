/**
 * Handles AI estimation integration orchestration.
 */
import { Injectable } from '@nestjs/common';
import type { AiEstimationResponseDto } from './dto/ai-estimation-response.dto';
import { GeminiProvider } from './providers/gemini.provider';

@Injectable()
export class AiService {
  /**
   * Injects the external AI provider adapter.
   * @param geminiProvider Provider used for remote AI communication.
   */
  public constructor(private readonly geminiProvider: GeminiProvider) {}

  /**
   * Requests an ICE estimation for a task description.
   * @param description Task description used as AI prompt context.
   * @returns Normalized ICE estimation returned by the provider adapter.
   */
  public async estimateIce(
    description: string,
  ): Promise<AiEstimationResponseDto> {
    return this.geminiProvider.estimateIce(description);
  }

  /**
   * Returns AI module bootstrap status.
   * @returns Informational message from provider adapter.
   */
  public getModuleStatus(): string {
    return this.geminiProvider.getStatus();
  }
}
