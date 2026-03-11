/**
 * Orchestrates task-related use cases for the Tasks module.
 */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TASK_REPOSITORY_PORT } from './ports/task-repository.port';
import type {
  CreateTaskInput,
  ListTasksSort,
  TaskRecord,
  TaskRepositoryPort,
  UpdateTaskInput,
} from './ports/task-repository.port';

@Injectable()
export class TasksService {
  /**
   * Creates TasksService with repository port dependency.
   * @param taskRepositoryPort Abstract repository for task persistence.
   */
  public constructor(
    @Inject(TASK_REPOSITORY_PORT)
    private readonly taskRepositoryPort: TaskRepositoryPort,
  ) {}

  /**
   * Creates one task using repository abstraction.
   * @param taskData Input payload for task creation.
   * @returns Newly created task record.
   */
  public async createTask(taskData: CreateTaskInput): Promise<TaskRecord> {
    return this.taskRepositoryPort.create({
      ...taskData,
      status: taskData.status ?? 'TODO',
    });
  }

  /**
   * Lists tasks using optional sorting criteria.
   * @param sort Optional list sorting criteria.
   * @returns Task list.
   */
  public async listTasks(sort?: ListTasksSort): Promise<TaskRecord[]> {
    return this.taskRepositoryPort.findAll(sort);
  }

  /**
   * Finds one task by id and throws when absent.
   * @param id Task identifier.
   * @returns Existing task record.
   */
  public async getTaskByIdOrThrow(id: string): Promise<TaskRecord> {
    const task = await this.taskRepositoryPort.findById(id);

    if (task === null) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  /**
   * Applies partial updates to a task.
   * @param id Task identifier.
   * @param updateData Partial task payload.
   * @returns Updated task record.
   */
  public async updateTask(
    id: string,
    updateData: UpdateTaskInput,
  ): Promise<TaskRecord> {
    const updatedTask = await this.taskRepositoryPort.update(id, updateData);

    if (updatedTask === null) {
      throw new NotFoundException('Task not found');
    }

    return updatedTask;
  }

  /**
   * Deletes a task and throws when absent.
   * @param id Task identifier.
   */
  public async deleteTask(id: string): Promise<void> {
    const deleted = await this.taskRepositoryPort.delete(id);

    if (!deleted) {
      throw new NotFoundException('Task not found');
    }
  }

  /**
   * Returns a status string to validate module wiring in early phases.
   * @returns Informational string confirming module and repository wiring.
   */
  public getModuleStatus(): string {
    return 'Tasks module ready with repository port';
  }
}
