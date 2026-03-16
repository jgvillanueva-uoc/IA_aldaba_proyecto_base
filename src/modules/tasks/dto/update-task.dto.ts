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
import { ApiPropertyOptional } from '@nestjs/swagger';

const TASK_STATUS_VALUES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

type TaskStatusValue = (typeof TASK_STATUS_VALUES)[number];

export class UpdateTaskDto {
  /**
   * Optional task title update
   */
  @ApiPropertyOptional({
    description: 'Optional task title update',
    minLength: 3,
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title?: string;

  /**
   * Optional task description update
   */
  @ApiPropertyOptional({
    description: 'Optional task description update',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  /**
   * Optional task status update
   */
  @ApiPropertyOptional({
    description: 'Optional task status update',
    enum: TASK_STATUS_VALUES,
  })
  @IsOptional()
  @IsIn(TASK_STATUS_VALUES)
  status?: TaskStatusValue;

  /**
   * Optional ICE impact update
   */
  @ApiPropertyOptional({
    description: 'Optional ICE impact update',
    minimum: 1,
    maximum: 10,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  impact?: number;

  /**
   * Optional ICE confidence update
   */
  @ApiPropertyOptional({
    description: 'Optional ICE confidence update',
    minimum: 1,
    maximum: 10,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  confidence?: number;

  /**
   * Optional ICE effort update
   */
  @ApiPropertyOptional({
    description: 'Optional ICE effort update',
    minimum: 1,
    maximum: 10,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  effort?: number;
}
