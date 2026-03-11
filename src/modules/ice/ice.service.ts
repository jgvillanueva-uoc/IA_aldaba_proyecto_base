/**
 * Encapsulates pure ICE domain logic: validation, calculation and clamping.
 * This service contains no infrastructure dependencies and no HTTP concerns.
 */
import { BadRequestException, Injectable } from '@nestjs/common';

/** Allowed inclusive bounds for ICE input values. */
const ICE_MIN = 1;
const ICE_MAX = 10;

@Injectable()
export class IceService {
  /**
   * Validates that an ICE input value is within the allowed 1–10 range.
   * Throws BadRequestException when the value is out of range.
   * @param value Numeric value to validate.
   * @param field Human-readable field name used in the error message.
   */
  public validateRange(value: number, field: string): void {
    if (value < ICE_MIN || value > ICE_MAX) {
      throw new BadRequestException(
        `${field} must be between ${ICE_MIN} and ${ICE_MAX}`,
      );
    }
  }

  /**
   * Calculates the ICE score using the standard formula:
   *   score = round((impact × confidence) / effort)
   * Assumes inputs are already validated and within 1–10 range.
   * @param impact Impact value (1–10).
   * @param confidence Confidence value (1–10).
   * @param effort Effort value (1–10, must be > 0 to avoid division by zero).
   * @returns Integer ICE score in the 0–100 range.
   */
  public calculateScore(
    impact: number,
    confidence: number,
    effort: number,
  ): number {
    return Math.round((impact * confidence) / effort);
  }

  /**
   * Clamps ICE input values to the valid 1–10 range.
   * Useful when values originate from external sources such as AI providers.
   * @param impact Raw impact value.
   * @param confidence Raw confidence value.
   * @param effort Raw effort value.
   * @returns Object with all three values clamped to [1, 10].
   */
  public clampValues(
    impact: number,
    confidence: number,
    effort: number,
  ): {
    readonly impact: number;
    readonly confidence: number;
    readonly effort: number;
  } {
    return {
      impact: Math.min(Math.max(impact, ICE_MIN), ICE_MAX),
      confidence: Math.min(Math.max(confidence, ICE_MIN), ICE_MAX),
      effort: Math.min(Math.max(effort, ICE_MIN), ICE_MAX),
    };
  }
}
