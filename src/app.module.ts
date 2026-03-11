import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './modules/tasks/tasks.module';
import { IceModule } from './modules/ice/ice.module';
import { AiModule } from './modules/ai/ai.module';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';

@Module({
  imports: [TasksModule, IceModule, AiModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
