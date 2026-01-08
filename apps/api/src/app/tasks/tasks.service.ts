import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Role } from '@task-manager/data';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private organizationsService: OrganizationsService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: any) {
    // Use organizationId from DTO if provided, otherwise use user's current organization
    const organizationId = createTaskDto.organizationId || user.orgId;
    
    if (!organizationId) {
      throw new ForbiddenException('Organization ID is required');
    }
    
    // Verify user has access to this organization
    const userRole = await this.organizationsService.getUserRoleInOrganization(user.userId, organizationId);
    if (!userRole) {
      throw new ForbiddenException(`You do not have access to this organization. User: ${user.userId}, Org: ${organizationId}`);
    }
    
    // Check if user can create tasks (VIEWER cannot)
    if (userRole === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot create tasks');
    }
    
    const task = this.tasksRepository.create({
      ...createTaskDto,
      organizationId,
      tags: createTaskDto.tags || [],
    });
    return this.tasksRepository.save(task);
  }

  async findAll(user: any) {
    // Get all organizations the user has access to (VIEW or higher)
    const userOrganizations = await this.organizationsService.getUserOrganizations(user.userId);
    
    // Extract organization IDs
    const organizationIds = userOrganizations.map(org => org.id);
    
    // If user has no organizations, return empty array
    if (organizationIds.length === 0) {
      return [];
    }
    
    // Return tasks from all organizations the user has access to
    return this.tasksRepository.find({
      where: { organizationId: In(organizationIds) },
      relations: ['assignee', 'organization'],
    });
  }

  async findOne(id: string, user: any) {
    // Get all organizations the user has access to
    const userOrganizations = await this.organizationsService.getUserOrganizations(user.userId);
    const organizationIds = userOrganizations.map(org => org.id);
    
    // Find task and verify it belongs to one of the user's organizations
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignee', 'organization'],
    });
    
    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    
    // Check if user has access to this task's organization
    if (!organizationIds.includes(task.organizationId)) {
      throw new ForbiddenException('You do not have access to this task');
    }
    
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: any) {
    const task = await this.findOne(id, user);
    
    // Get user's role in the task's organization
    const userRole = await this.organizationsService.getUserRoleInOrganization(user.userId, task.organizationId);
    if (userRole === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot update tasks');
    }

    console.log(`[AUDIT] User ${user.username} (${userRole}) updated task ${id}`);
    Object.assign(task, {
      ...updateTaskDto,
      tags: updateTaskDto.tags || [],
    });
    return this.tasksRepository.save(task);
  }

  async remove(id: string, user: any) {
    const task = await this.findOne(id, user);
    
    // Get user's role in the task's organization
    const userRole = await this.organizationsService.getUserRoleInOrganization(user.userId, task.organizationId);
    if (userRole === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot delete tasks');
    }
    
    console.log(`[AUDIT] User ${user.username} (${userRole}) deleted task ${id}`);
    return this.tasksRepository.remove(task);
  }
}
