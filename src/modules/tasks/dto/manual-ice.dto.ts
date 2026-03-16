/**
 * DTO for manual ICE assignment via HTTP payload.
 * All three fields are required and must be in the 1-10 range.
 */
import { IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ManualIceDto {
  /**
   * Impact score: how much value the task delivers if completed
   */
  @ApiProperty({
    description: 'Impact score: how much value the task delivers if completed',
    minimum: 1,
    maximum: 10,
    type: Number,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  impact!: number;

  /**
   * Confidence score: how certain the team is about the impact estimate
   */
  @ApiProperty({
    description:
      'Confidence score: how certain the team is about the impact estimate',
    minimum: 1,
    maximum: 10,
    type: Number,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  confidence!: number;

  /**
   * Effort score: relative cost to implement the task
   */
  @ApiProperty({
    description: 'Effort score: relative cost to implement the task',
    minimum: 1,
    maximum: 10,
    type: Number,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  effort!: number;
}
