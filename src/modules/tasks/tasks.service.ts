/**
 * Orchestrates task-related use cases for the Tasks module.
 */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { IceService } from '../ice/ice.service';
import { TASK_REPOSITORY_PORT } from './ports/task-repository.port';
import type {
  CreateTaskInput,
  ListTasksSort,
  TaskRecord,
  TaskRepositoryPort,
  UpdateTaskInput,
} from './ports/task-repository.port';
import type { ManualIceDto } from './dto/manual-ice.dto';

@Injectable()
export class TasksService {
  /**
   * Creates TasksService with repository and domain dependencies.
   * @param taskRepositoryPort Abstract repository for task persistence.
   * @param aiService Application service for external AI estimation.
   * @param iceService Domain service for ICE score calculation and validation.
   */
  public constructor(
    @Inject(TASK_REPOSITORY_PORT)
    private readonly taskRepositoryPort: TaskRepositoryPort,
    private readonly aiService: AiService,
    private readonly iceService: IceService,
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
   * When any ICE field (impact, confidence, effort) is included in the update
   * and all three values are non-null after merging, recalculates iceScore
   * automatically and sets iceSource to MANUAL.
   * @param id Task identifier.
   * @param updateData Partial task payload.
   * @returns Updated task record.
   */
  public async updateTask(
    id: string,
    updateData: UpdateTaskInput,
  ): Promise<TaskRecord> {
    const currentTask = await this.getTaskByIdOrThrow(id);

    const iceFieldChanged =
      updateData.impact !== undefined ||
      updateData.confidence !== undefined ||
      updateData.effort !== undefined;

    const finalImpact: number | null = updateData.impact ?? currentTask.impact;
    const finalConfidence: number | null =
      updateData.confidence ?? currentTask.confidence;
    const finalEffort: number | null = updateData.effort ?? currentTask.effort;

    let iceRecalc: Partial<UpdateTaskInput> = {};

    if (
      iceFieldChanged &&
      finalImpact !== null &&
      finalConfidence !== null &&
      finalEffort !== null
    ) {
      iceRecalc = {
        iceScore: this.iceService.calculateScore(
          finalImpact,
          finalConfidence,
          finalEffort,
        ),
        iceSource: 'MANUAL',
      };
    }

    const updatedTask = await this.taskRepositoryPort.update(id, {
      ...updateData,
      ...iceRecalc,
    });

    if (updatedTask === null) {
      throw new NotFoundException('Task not found');
    }

    return updatedTask;
  }

  /**
   * Applies manual ICE values to a task and calculates the ICE score.
   * Persists impact, confidence, effort, iceScore and sets iceSource to MANUAL.
   * Throws 404 when the task does not exist.
   * @param id Task identifier.
   * @param dto Validated ICE input payload.
   * @returns Updated task with calculated ICE score.
   */
  public async applyManualIce(
    id: string,
    dto: ManualIceDto,
  ): Promise<TaskRecord> {
    await this.getTaskByIdOrThrow(id);

    this.iceService.validateRange(dto.impact, 'impact');
    this.iceService.validateRange(dto.confidence, 'confidence');
    this.iceService.validateRange(dto.effort, 'effort');

    const iceScore = this.iceService.calculateScore(
      dto.impact,
      dto.confidence,
      dto.effort,
    );

    const updatedTask = await this.taskRepositoryPort.update(id, {
      impact: dto.impact,
      confidence: dto.confidence,
      effort: dto.effort,
      iceScore,
      iceSource: 'MANUAL',
    });

    if (updatedTask === null) {
      throw new NotFoundException('Task not found');
    }

    return updatedTask;
  }

  /**
   * Estimates ICE values with the AI provider, clamps them through IceService,
   * calculates the final score and persists the result with AI source.
   * @param id Task identifier.
   * @returns Updated task with AI-estimated ICE values.
   */
  public async estimateIceWithAi(id: string): Promise<TaskRecord> {
    const task = await this.getTaskByIdOrThrow(id);
    const estimation = await this.aiService.estimateIce(task.description);
    const clampedValues = this.iceService.clampValues(
      estimation.impact,
      estimation.confidence,
      estimation.effort,
    );
    const iceScore = this.iceService.calculateScore(
      clampedValues.impact,
      clampedValues.confidence,
      clampedValues.effort,
    );

    const updatedTask = await this.taskRepositoryPort.update(id, {
      impact: clampedValues.impact,
      confidence: clampedValues.confidence,
      effort: clampedValues.effort,
      iceScore,
      iceSource: 'AI',
    });

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
}
