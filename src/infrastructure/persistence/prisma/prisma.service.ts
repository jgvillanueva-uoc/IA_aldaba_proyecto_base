/**
 * Provides the Prisma persistence facade used by repository adapters.
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService {
  /**
   * Returns adapter bootstrap status while Prisma client is not yet integrated.
   * @returns Status message for infrastructure health checks.
   */
  public getStatus(): string {
    return 'Prisma service placeholder ready';
  }
}
