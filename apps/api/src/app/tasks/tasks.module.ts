import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), OrganizationsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
