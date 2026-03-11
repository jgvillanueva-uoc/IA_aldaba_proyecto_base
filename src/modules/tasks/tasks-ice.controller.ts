/**
 * Groups ICE-related task routes under the /tasks/:id namespace.
 */
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import type { TaskRecord } from './ports/task-repository.port';
import { ManualIceDto } from './dto/manual-ice.dto';
import { TasksService } from './tasks.service';

@Controller('tasks/:id/ice')
export class TasksIceController {
  /**
   * Injects task application service for ICE use cases.
   * @param tasksService Service that orchestrates task and ICE use cases.
   */
  public constructor(private readonly tasksService: TasksService) {}

  /**
   * Assigns manual ICE values to a task and persists the calculated score.
   * Returns 404 when the task does not exist.
   * Returns 400 when any ICE value is outside the 1–10 range.
   * @param id Task identifier from route parameter.
   * @param manualIceDto Validated ICE input payload.
   * @returns Updated task with calculated iceScore and iceSource set to MANUAL.
   */
  @Post('manual')
  public applyManualIce(
    @Param('id') id: string,
    @Body() manualIceDto: ManualIceDto,
  ): Promise<TaskRecord> {
    return this.tasksService.applyManualIce(id, manualIceDto);
  }

  /**
   * Estimates ICE values through the AI provider and persists the result.
   * @param id Task identifier from route parameter.
   * @returns Updated task with AI-estimated ICE values and source metadata.
   */
  @Post('estimate')
  @HttpCode(HttpStatus.OK)
  public estimateIce(@Param('id') id: string): Promise<TaskRecord> {
    return this.tasksService.estimateIceWithAi(id);
  }
}
