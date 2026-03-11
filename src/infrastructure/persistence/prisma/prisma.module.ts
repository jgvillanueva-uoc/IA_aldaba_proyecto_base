/**
 * Registers Prisma infrastructure services and repository adapters.
 */
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaTaskRepository } from './prisma-task.repository';

@Module({
  providers: [PrismaService, PrismaTaskRepository],
  exports: [PrismaService, PrismaTaskRepository],
})
export class PrismaModule {}
