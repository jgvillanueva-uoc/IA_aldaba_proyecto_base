/**
 * Exposes base HTTP routes for task operations.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { TaskRecord } from './ports/task-repository.port';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  /**
   * Injects task application service.
   * @param tasksService Service that orchestrates task use cases.
   */
  public constructor(private readonly tasksService: TasksService) {}

  /**
   * Creates one task from HTTP payload.
   * @param createTaskDto Task creation payload.
   * @returns Created task.
   */
  @Post()
  public createTask(@Body() createTaskDto: CreateTaskDto): Promise<TaskRecord> {
    return this.tasksService.createTask(createTaskDto);
  }

  /**
   * Lists tasks with optional sorting criteria.
   * @param queryDto Query payload.
   * @returns List of tasks.
   */
  @Get()
  public listTasks(
    @Query() queryDto: ListTasksQueryDto,
  ): Promise<TaskRecord[]> {
    return this.tasksService.listTasks(queryDto.sort);
  }

  /**
   * Gets one task by identifier.
   * @param id Task identifier.
   * @returns Found task.
   */
  @Get(':id')
  public getTaskById(@Param('id') id: string): Promise<TaskRecord> {
    return this.tasksService.getTaskByIdOrThrow(id);
  }

  /**
   * Applies partial task updates.
   * @param id Task identifier.
   * @param updateTaskDto Partial task payload.
   * @returns Updated task.
   */
  @Patch(':id')
  public updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskRecord> {
    return this.tasksService.updateTask(id, updateTaskDto);
  }

  /**
   * Deletes one task by identifier.
   * @param id Task identifier.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteTask(@Param('id') id: string): Promise<void> {
    await this.tasksService.deleteTask(id);
  }
}
