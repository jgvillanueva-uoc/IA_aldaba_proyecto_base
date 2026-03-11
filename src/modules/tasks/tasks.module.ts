/**
 * Wires controllers and services for the Tasks bounded context.
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module';
import { PrismaTaskRepository } from '../../infrastructure/persistence/prisma/prisma-task.repository';
import { TASK_REPOSITORY_PORT } from './ports/task-repository.port';
import { TasksController } from './tasks.controller';
import { TasksIceController } from './tasks-ice.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController, TasksIceController],
  providers: [
    TasksService,
    {
      provide: TASK_REPOSITORY_PORT,
      useClass: PrismaTaskRepository,
    },
  ],
  exports: [TasksService],
})
export class TasksModule {}
