/**
 * Provides the Prisma persistence facade used by repository adapters.
 */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Creates Prisma client with a safe local SQLite default when DATABASE_URL is not set.
   */
  public constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL ?? 'file:./dev.db',
        },
      },
    });
  }

  /**
   * Opens Prisma connection during module bootstrap.
   * @returns Promise resolved when Prisma is connected.
   */
  public async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Closes Prisma connection on application shutdown.
   * @returns Promise resolved when Prisma is disconnected.
   */
  public async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Returns adapter runtime status for health checks.
   * @returns Status message for infrastructure health checks.
   */
  public getStatus(): string {
    return 'Prisma service connected';
  }
}
