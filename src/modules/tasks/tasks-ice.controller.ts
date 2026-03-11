/**
 * Groups ICE-related task routes under the /tasks/:id namespace.
 */
import { Controller, Param, Post } from '@nestjs/common';

@Controller('tasks/:id/ice')
export class TasksIceController {
  /**
   * Placeholder endpoint for manual ICE assignment route wiring.
   * @param id Task identifier from route parameter.
   * @returns Route readiness payload.
   */
  @Post('manual')
  public manualIce(@Param('id') id: string): {
    readonly taskId: string;
    readonly route: string;
  } {
    return {
      taskId: id,
      route: 'manual',
    };
  }

  /**
   * Placeholder endpoint for AI ICE estimation route wiring.
   * @param id Task identifier from route parameter.
   * @returns Route readiness payload.
   */
  @Post('estimate')
  public estimateIce(@Param('id') id: string): {
    readonly taskId: string;
    readonly route: string;
  } {
    return {
      taskId: id,
      route: 'estimate',
    };
  }
}
