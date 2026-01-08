/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { Role } from '@task-manager/data';

describe('TasksService - RBAC Tests', () => {
  let service: TasksService;
  let tasksRepository: Repository<Task>;
  let organizationsService: OrganizationsService;

  // Mock data
  const mockOwnerUser = {
    userId: 'owner-user-id',
    username: 'owner@test.com',
    role: Role.OWNER,
    orgId: 'org-1',
  };

  const mockAdminUser = {
    userId: 'admin-user-id',
    username: 'admin@test.com',
    role: Role.ADMIN,
    orgId: 'org-1',
  };

  const mockViewerUser = {
    userId: 'viewer-user-id',
    username: 'viewer@test.com',
    role: Role.VIEWER,
    orgId: 'org-1',
  };

  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'OPEN',
    organizationId: 'org-1',
    assigneeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateTaskDto = {
    title: 'New Task',
    description: 'New Task Description',
    status: 'OPEN',
    organizationId: 'org-1',
  };

  const mockOrganizations = [
    { id: 'org-1', name: 'Organization 1' },
    { id: 'org-2', name: 'Organization 2' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: OrganizationsService,
          useValue: {
            getUserOrganizations: jest.fn(),
            getUserRoleInOrganization: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    tasksRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    organizationsService = module.get<OrganizationsService>(OrganizationsService);
  });

  describe('Task Creation - RBAC', () => {
    /**
     * Test 1: OWNER can create tasks
     * Verifies that users with OWNER role can successfully create tasks
     */
    it('should allow OWNER to create tasks', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.OWNER);
      jest.spyOn(tasksRepository, 'create').mockReturnValue(mockTask as any);
      jest.spyOn(tasksRepository, 'save').mockResolvedValue(mockTask as any);

      const result = await service.create(mockCreateTaskDto, mockOwnerUser);

      expect(organizationsService.getUserRoleInOrganization).toHaveBeenCalledWith(
        mockOwnerUser.userId,
        'org-1'
      );
      expect(tasksRepository.create).toHaveBeenCalled();
      expect(tasksRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });

    /**
     * Test 2: ADMIN can create tasks
     * Verifies that users with ADMIN role can successfully create tasks
     */
    it('should allow ADMIN to create tasks', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.ADMIN);
      jest.spyOn(tasksRepository, 'create').mockReturnValue(mockTask as any);
      jest.spyOn(tasksRepository, 'save').mockResolvedValue(mockTask as any);

      const result = await service.create(mockCreateTaskDto, mockAdminUser);

      expect(organizationsService.getUserRoleInOrganization).toHaveBeenCalledWith(
        mockAdminUser.userId,
        'org-1'
      );
      expect(result).toEqual(mockTask);
    });

    /**
     * Test 3: VIEWER cannot create tasks
     * Verifies that users with VIEWER role are forbidden from creating tasks
     */
    it('should prevent VIEWER from creating tasks', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.VIEWER);

      await expect(service.create(mockCreateTaskDto, mockViewerUser)).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.create(mockCreateTaskDto, mockViewerUser)).rejects.toThrow(
        'Viewers cannot create tasks'
      );
      expect(tasksRepository.create).not.toHaveBeenCalled();
      expect(tasksRepository.save).not.toHaveBeenCalled();
    });

    /**
     * Test 4: User without organization access cannot create tasks
     * Verifies that users without access to an organization cannot create tasks in it
     */
    it('should prevent user without organization access from creating tasks', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(null);

      await expect(service.create(mockCreateTaskDto, mockOwnerUser)).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.create(mockCreateTaskDto, mockOwnerUser)).rejects.toThrow(
        'You do not have access to this organization'
      );
    });
  });

  describe('Task Updates - RBAC', () => {
    /**
     * Test 5: OWNER can update tasks
     * Verifies that users with OWNER role can update tasks in their organization
     */
    it('should allow OWNER to update tasks', async () => {
      jest.spyOn(organizationsService, 'getUserOrganizations').mockResolvedValue(mockOrganizations as any);
      jest.spyOn(tasksRepository, 'findOne').mockResolvedValue(mockTask as any);
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.OWNER);
      jest.spyOn(tasksRepository, 'save').mockResolvedValue({ ...mockTask, title: 'Updated Title' } as any);

      const updateDto = { title: 'Updated Title' };
      const result = await service.update('task-1', updateDto, mockOwnerUser);

      expect(organizationsService.getUserRoleInOrganization).toHaveBeenCalledWith(
        mockOwnerUser.userId,
        'org-1'
      );
      expect(tasksRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
    });

    /**
     * Test 6: ADMIN can update tasks
     * Verifies that users with ADMIN role can update tasks in their organization
     */
    it('should allow ADMIN to update tasks', async () => {
      jest.spyOn(organizationsService, 'getUserOrganizations').mockResolvedValue(mockOrganizations as any);
      jest.spyOn(tasksRepository, 'findOne').mockResolvedValue(mockTask as any);
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.ADMIN);
      jest.spyOn(tasksRepository, 'save').mockResolvedValue({ ...mockTask, title: 'Updated Title' } as any);

      const updateDto = { title: 'Updated Title' };
      const result = await service.update('task-1', updateDto, mockAdminUser);

      expect(organizationsService.getUserRoleInOrganization).toHaveBeenCalledWith(
        mockAdminUser.userId,
        'org-1'
      );
      expect(result.title).toBe('Updated Title');
    });

    /**
     * Test 7: VIEWER cannot update tasks
     * Verifies that users with VIEWER role are forbidden from updating tasks
     */
    it('should prevent VIEWER from updating tasks', async () => {
      jest.spyOn(organizationsService, 'getUserOrganizations').mockResolvedValue(mockOrganizations as any);
      jest.spyOn(tasksRepository, 'findOne').mockResolvedValue(mockTask as any);
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.VIEWER);

      const updateDto = { title: 'Updated Title' };

      await expect(service.update('task-1', updateDto, mockViewerUser)).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.update('task-1', updateDto, mockViewerUser)).rejects.toThrow(
        'Viewers cannot update tasks'
      );
      expect(tasksRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Task Deletion - RBAC', () => {
    /**
     * Test 8: OWNER can delete tasks
     * Verifies that users with OWNER role can delete tasks in their organization
     */
    it('should allow OWNER to delete tasks', async () => {
      jest.spyOn(organizationsService, 'getUserOrganizations').mockResolvedValue(mockOrganizations as any);
      jest.spyOn(tasksRepository, 'findOne').mockResolvedValue(mockTask as any);
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.OWNER);
      jest.spyOn(tasksRepository, 'remove').mockResolvedValue(mockTask as any);

      await service.remove('task-1', mockOwnerUser);

      expect(organizationsService.getUserRoleInOrganization).toHaveBeenCalledWith(
        mockOwnerUser.userId,
        'org-1'
      );
      expect(tasksRepository.remove).toHaveBeenCalled();
    });

    /**
     * Test 9: ADMIN can delete tasks
     * Verifies that users with ADMIN role can delete tasks in their organization
     */
    it('should allow ADMIN to delete tasks', async () => {
      jest.spyOn(organizationsService, 'getUserOrganizations').mockResolvedValue(mockOrganizations as any);
      jest.spyOn(tasksRepository, 'findOne').mockResolvedValue(mockTask as any);
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.ADMIN);
      jest.spyOn(tasksRepository, 'remove').mockResolvedValue(mockTask as any);

      await service.remove('task-1', mockAdminUser);

      expect(organizationsService.getUserRoleInOrganization).toHaveBeenCalledWith(
        mockAdminUser.userId,
        'org-1'
      );
      expect(tasksRepository.remove).toHaveBeenCalled();
    });

    /**
     * Test 10: VIEWER cannot delete tasks
     * Verifies that users with VIEWER role are forbidden from deleting tasks
     */
    it('should prevent VIEWER from deleting tasks', async () => {
      jest.spyOn(organizationsService, 'getUserOrganizations').mockResolvedValue(mockOrganizations as any);
      jest.spyOn(tasksRepository, 'findOne').mockResolvedValue(mockTask as any);
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.VIEWER);

      await expect(service.remove('task-1', mockViewerUser)).rejects.toThrow(ForbiddenException);
      await expect(service.remove('task-1', mockViewerUser)).rejects.toThrow(
        'Viewers cannot delete tasks'
      );
      expect(tasksRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('Task Viewing - Cross-Organization Access', () => {
    /**
     * Test 11: Users can only view tasks from organizations they have access to
     * Verifies that findAll returns only tasks from organizations the user belongs to
     */
    it('should return only tasks from user accessible organizations', async () => {
      const tasksFromOrg1 = [{ ...mockTask, id: 'task-1', organizationId: 'org-1' }];
      const tasksFromOrg2 = [{ ...mockTask, id: 'task-2', organizationId: 'org-2' }];
      
      jest.spyOn(organizationsService, 'getUserOrganizations').mockResolvedValue(mockOrganizations as any);
      jest.spyOn(tasksRepository, 'find').mockResolvedValue([...tasksFromOrg1, ...tasksFromOrg2] as any);

      const result = await service.findAll(mockOwnerUser);

      expect(organizationsService.getUserOrganizations).toHaveBeenCalledWith(mockOwnerUser.userId);
      expect(tasksRepository.find).toHaveBeenCalledWith({
        where: { organizationId: expect.anything() },
        relations: ['assignee', 'organization'],
      });
      expect(result.length).toBeGreaterThan(0);
    });

    /**
     * Test 12: Users cannot access tasks from organizations they do not belong to
     * Verifies that findOne throws ForbiddenException for tasks in inaccessible organizations
     */
    it('should prevent access to tasks from inaccessible organizations', async () => {
      const taskFromInaccessibleOrg = { ...mockTask, organizationId: 'org-3' };
      
      jest.spyOn(organizationsService, 'getUserOrganizations').mockResolvedValue(mockOrganizations as any);
      jest.spyOn(tasksRepository, 'findOne').mockResolvedValue(taskFromInaccessibleOrg as any);

      await expect(service.findOne('task-1', mockOwnerUser)).rejects.toThrow(ForbiddenException);
      await expect(service.findOne('task-1', mockOwnerUser)).rejects.toThrow(
        'You do not have access to this task'
      );
    });

    /**
     * Test 13: VIEWER can view tasks (read-only access)
     * Verifies that VIEWER role users can still view tasks from their organizations
     */
    it('should allow VIEWER to view tasks from accessible organizations', async () => {
      jest.spyOn(organizationsService, 'getUserOrganizations').mockResolvedValue(mockOrganizations as any);
      jest.spyOn(tasksRepository, 'findOne').mockResolvedValue(mockTask as any);

      const result = await service.findOne('task-1', mockViewerUser);

      expect(organizationsService.getUserOrganizations).toHaveBeenCalledWith(mockViewerUser.userId);
      expect(result).toEqual(mockTask);
    });
  });
});

