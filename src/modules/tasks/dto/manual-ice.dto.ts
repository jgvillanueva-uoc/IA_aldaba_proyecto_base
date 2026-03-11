/**
 * DTO for manual ICE assignment via HTTP payload.
 * All three fields are required and must be in the 1–10 range.
 */
import { IsInt, Max, Min } from 'class-validator';

export class ManualIceDto {
  /**
   * Impact score: how much value the task delivers if completed.
   */
  @IsInt()
  @Min(1)
  @Max(10)
  public readonly impact!: number;

  /**
   * Confidence score: how certain the team is about the impact estimate.
   */
  @IsInt()
  @Min(1)
  @Max(10)
  public readonly confidence!: number;

  /**
   * Effort score: relative cost to implement the task.
   */
  @IsInt()
  @Min(1)
  @Max(10)
  public readonly effort!: number;
}
