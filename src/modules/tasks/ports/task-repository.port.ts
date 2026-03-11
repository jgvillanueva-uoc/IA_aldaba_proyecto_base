/**
 * Defines the persistence contract for Task aggregate operations.
 */
export interface TaskRecord {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface TaskRepositoryPort {
  /**
   * Persists a new task.
   * @param taskData Minimal data required to create a task.
   * @returns Created task record.
   */
  create(
    taskData: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<TaskRecord>;

  /**
   * Finds a task by identifier.
   * @param id Task identifier.
   * @returns Task record or null when not found.
   */
  findById(id: string): Promise<TaskRecord | null>;
}
