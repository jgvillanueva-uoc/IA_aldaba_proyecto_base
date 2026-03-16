/**
 * Defines the persistence contract for Task aggregate operations.
 */
export const TASK_REPOSITORY_PORT = Symbol('TASK_REPOSITORY_PORT');

export interface TaskRecord {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  readonly impact: number | null;
  readonly confidence: number | null;
  readonly effort: number | null;
  readonly iceScore: number | null;
  readonly iceSource: 'MANUAL' | 'AI' | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateTaskInput {
  readonly title: string;
  readonly description: string;
  readonly status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

export interface UpdateTaskInput {
  readonly title?: string;
  readonly description?: string;
  readonly status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  readonly impact?: number | null;
  readonly confidence?: number | null;
  readonly effort?: number | null;
  readonly iceScore?: number | null;
  readonly iceSource?: 'MANUAL' | 'AI' | null;
}

export type ListTasksSort = 'createdAt' | 'ice';

export interface TaskRepositoryPort {
  /**
   * Persists a new task.
   * @param taskData Minimal data required to create a task.
   * @returns Created task record.
   */
  create(taskData: CreateTaskInput): Promise<TaskRecord>;

  /**
   * Finds a task by identifier.
   * @param id Task identifier.
   * @returns Task record or null when not found.
   */
  findById(id: string): Promise<TaskRecord | null>;

  /**
   * Lists tasks with optional sort criteria.
   * @param sort Optional list sorting criteria.
   * @returns Task list.
   */
  findAll(sort?: ListTasksSort): Promise<TaskRecord[]>;

  /**
   * Lists tasks ordered by ICE priority (iceScore) with direction and stable tie-breakers.
   * @param order 'asc' | 'desc' direction.
   * @returns Task list ordered by priority.
   */
  findAllByPriority(order: 'asc' | 'desc'): Promise<TaskRecord[]>;

  /**
   * Updates a task by identifier.
   * @param id Task identifier.
   * @param updateData Partial task payload to persist.
   * @returns Updated task or null when not found.
   */
  update(id: string, updateData: UpdateTaskInput): Promise<TaskRecord | null>;

  /**
   * Deletes a task by identifier.
   * @param id Task identifier.
   * @returns True when a task was deleted, false when the task does not exist.
   */
  delete(id: string): Promise<boolean>;
}
