/**
 * Exposes base HTTP routes for task operations.
 */
import { Controller, Get } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  /**
   * Injects task application service.
   * @param tasksService Service that orchestrates task use cases.
   */
  public constructor(private readonly tasksService: TasksService) {}

  /**
   * Provides a minimal endpoint to validate module mounting.
   * @returns Module readiness message.
   */
  @Get('health')
  public getHealth(): string {
    return this.tasksService.getModuleStatus();
  }
}
