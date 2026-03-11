/**
 * Orchestrates task-related use cases for the Tasks module.
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class TasksService {
  /**
   * Returns a placeholder status message for bootstrap validation.
   * @returns Informational string confirming module wiring.
   */
  public getModuleStatus(): string {
    return 'Tasks module ready';
  }
}
