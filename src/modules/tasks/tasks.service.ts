/**
 * Orchestrates task-related use cases for the Tasks module.
 */
import { Inject, Injectable } from '@nestjs/common';
import { TASK_REPOSITORY_PORT } from './ports/task-repository.port';
import type {
  CreateTaskInput,
  TaskRecord,
  TaskRepositoryPort,
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
    return this.taskRepositoryPort.create(taskData);
  }

  /**
   * Finds one task by id using repository abstraction.
   * @param id Task identifier.
   * @returns Task record or null when absent.
   */
  public async getTaskById(id: string): Promise<TaskRecord | null> {
    return this.taskRepositoryPort.findById(id);
  }

  /**
   * Returns a status string to validate module wiring in early phases.
   * @returns Informational string confirming module and repository wiring.
   */
  public getModuleStatus(): string {
    return 'Tasks module ready with repository port';
  }
}
