/**
 * DTO for listing tasks with optional sorting criteria.
 */
import { IsIn, IsOptional } from 'class-validator';

const LIST_SORT_VALUES = ['ice'] as const;

type ListSortValue = (typeof LIST_SORT_VALUES)[number];

export class ListTasksQueryDto {
  /**
   * Optional sorting mode.
   */
  @IsOptional()
  @IsIn(LIST_SORT_VALUES)
  public readonly sort?: ListSortValue;
}
