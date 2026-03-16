import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const PRIORITY_ORDER_VALUES = ['asc', 'desc'] as const;
export type PriorityOrder = (typeof PRIORITY_ORDER_VALUES)[number];

export class PriorityTasksQueryDto {
  @ApiPropertyOptional({
    enum: PRIORITY_ORDER_VALUES,
    description: 'Orden de prioridad (asc o desc)',
    default: 'desc',
  })
  @IsOptional()
  @IsIn(PRIORITY_ORDER_VALUES, {
    message: 'order must be one of the following values: asc, desc',
  })
  order?: PriorityOrder = 'desc';
}
