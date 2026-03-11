/**
 * Contains pure ICE domain utilities and calculations.
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class IceService {
  /**
   * Returns a readiness message for bootstrap verification.
   * @returns Informational message.
   */
  public getModuleStatus(): string {
    return 'ICE module ready';
  }
}
