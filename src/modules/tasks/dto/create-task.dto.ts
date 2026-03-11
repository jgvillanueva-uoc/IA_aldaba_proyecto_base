/**
 * DTO for creating one task from HTTP payload.
 */
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const TASK_STATUS_VALUES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

type TaskStatusValue = (typeof TASK_STATUS_VALUES)[number];

export class CreateTaskDto {
  /**
   * Task title shown to users.
   */
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  public readonly title!: string;

  /**
   * Task description with acceptance context.
   */
  @IsString()
  @MaxLength(200)
  public readonly description!: string;

  /**
   * Optional status at creation time.
   */
  @IsOptional()
  @IsIn(TASK_STATUS_VALUES)
  public readonly status?: TaskStatusValue;
}
