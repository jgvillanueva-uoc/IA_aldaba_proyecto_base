/**
 * Bootstrap placeholder for Task repository Prisma adapter.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTaskRepository {
  /**
   * Injects low-level Prisma service.
   * @param prismaService Infrastructure service for Prisma access.
   */
  public constructor(private readonly prismaService: PrismaService) {}

  /**
   * Returns repository bootstrap status for wiring validation.
   * @returns Status text from adapter layer.
   */
  public getStatus(): string {
    return this.prismaService.getStatus();
  }
}
