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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const TASK_STATUS_VALUES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

type TaskStatusValue = (typeof TASK_STATUS_VALUES)[number];

export class CreateTaskDto {
  /**
   * Task title shown to users
   */
  @ApiProperty({
    description: 'Task title shown to users',
    minLength: 3,
    maxLength: 120,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  /**
   * Task description with acceptance context
   */
  @ApiProperty({
    description: 'Task description with acceptance context',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  description!: string;

  /**
   * Optional status at creation time
   */
  @ApiPropertyOptional({
    description: 'Optional status at creation time',
    enum: TASK_STATUS_VALUES,
  })
  @IsOptional()
  @IsIn(TASK_STATUS_VALUES)
  status?: TaskStatusValue;
}
