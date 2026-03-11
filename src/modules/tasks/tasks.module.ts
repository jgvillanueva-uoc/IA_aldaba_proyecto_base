/**
 * Wires controllers and services for the Tasks bounded context.
 */
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksIceController } from './tasks-ice.controller';
import { TasksService } from './tasks.service';

@Module({
  controllers: [TasksController, TasksIceController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
