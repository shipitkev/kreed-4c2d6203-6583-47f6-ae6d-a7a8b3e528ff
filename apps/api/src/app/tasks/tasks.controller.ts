import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles, CurrentUser } from '@task-manager/auth';
import { Role } from '@task-manager/data';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user) {
    return this.tasksService.create(createTaskDto, user);
  }

  @Get()
  findAll(@CurrentUser() user) {
    return this.tasksService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.tasksService.findOne(id, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @CurrentUser() user) {
    return this.tasksService.update(id, updateTaskDto, user);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.tasksService.remove(id, user);
  }
}
