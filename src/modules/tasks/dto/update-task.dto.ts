/**
 * DTO for partial task updates from HTTP payload.
 */
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const TASK_STATUS_VALUES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

type TaskStatusValue = (typeof TASK_STATUS_VALUES)[number];

export class UpdateTaskDto {
  /**
   * Optional task title update.
   */
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  public readonly title?: string;

  /**
   * Optional task description update.
   */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  public readonly description?: string;

  /**
   * Optional task status update.
   */
  @IsOptional()
  @IsIn(TASK_STATUS_VALUES)
  public readonly status?: TaskStatusValue;

  /**
   * Optional ICE impact update.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  public readonly impact?: number;

  /**
   * Optional ICE confidence update.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  public readonly confidence?: number;

  /**
   * Optional ICE effort update.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  public readonly effort?: number;
}
