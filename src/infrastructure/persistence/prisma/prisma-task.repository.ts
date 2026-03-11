/**
 * Implements TaskRepositoryPort using Prisma as persistence adapter.
 */
import { Injectable } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import {
  CreateTaskInput,
  ListTasksSort,
  TaskRecord,
  TaskRepositoryPort,
  UpdateTaskInput,
} from '../../../modules/tasks/ports/task-repository.port';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTaskRepository implements TaskRepositoryPort {
  /**
   * Injects low-level Prisma service.
   * @param prismaService Infrastructure service for Prisma access.
   */
  public constructor(private readonly prismaService: PrismaService) {}

  /**
   * Persists a new task record in the database.
   * @param taskData Required task creation payload.
   * @returns Created task mapped to repository contract.
   */
  public async create(taskData: CreateTaskInput): Promise<TaskRecord> {
    const createdTask = await this.prismaService.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
      },
    });

    return this.toTaskRecord(createdTask);
  }

  /**
   * Finds one task by id.
   * @param id Task identifier.
   * @returns Found task or null when absent.
   */
  public async findById(id: string): Promise<TaskRecord | null> {
    const task = await this.prismaService.task.findUnique({
      where: { id },
    });

    return task === null ? null : this.toTaskRecord(task);
  }

  /**
   * Lists tasks ordered by repository sort criteria.
   * @param sort Optional sort option.
   * @returns Ordered list of task records.
   */
  public async findAll(sort?: ListTasksSort): Promise<TaskRecord[]> {
    const orderBy =
      sort === 'ice'
        ? [{ iceScore: 'desc' as const }, { createdAt: 'desc' as const }]
        : [{ createdAt: 'desc' as const }];

    const tasks = await this.prismaService.task.findMany({ orderBy });

    return tasks.map((task) => this.toTaskRecord(task));
  }

  /**
   * Updates a task by id.
   * @param id Task identifier.
   * @param updateData Partial payload with fields to update.
   * @returns Updated task or null when absent.
   */
  public async update(
    id: string,
    updateData: UpdateTaskInput,
  ): Promise<TaskRecord | null> {
    const existingTask = await this.prismaService.task.findUnique({
      where: { id },
      select: { id: true },
    });

    if (existingTask === null) {
      return null;
    }

    const updatedTask = await this.prismaService.task.update({
      where: { id },
      data: {
        ...updateData,
      },
    });

    return this.toTaskRecord(updatedTask);
  }

  /**
   * Deletes a task by id.
   * @param id Task identifier.
   * @returns True when deleted, false when absent.
   */
  public async delete(id: string): Promise<boolean> {
    const existingTask = await this.prismaService.task.findUnique({
      where: { id },
      select: { id: true },
    });

    if (existingTask === null) {
      return false;
    }

    await this.prismaService.task.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Maps Prisma entity to TaskRepositoryPort record.
   * @param task Prisma task entity.
   * @returns Task record normalized for application layer.
   */
  private toTaskRecord(task: {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly status: TaskStatus;
    readonly impact: number | null;
    readonly confidence: number | null;
    readonly effort: number | null;
    readonly iceScore: number | null;
    readonly iceSource: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  }): TaskRecord {
    const iceSource =
      task.iceSource === 'MANUAL' || task.iceSource === 'AI'
        ? task.iceSource
        : null;

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      impact: task.impact,
      confidence: task.confidence,
      effort: task.effort,
      iceScore: task.iceScore,
      iceSource,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
