/**
 * Defines the normalized ICE estimation payload returned by the AI module.
 */
export interface AiEstimationResponseDto {
  readonly impact: number;
  readonly confidence: number;
  readonly effort: number;
}
