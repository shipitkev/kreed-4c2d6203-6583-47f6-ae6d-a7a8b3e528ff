/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { UsersService } from '../users/users.service';
import { Role } from '@task-manager/data';

describe('OrganizationsController - RBAC Tests', () => {
  let controller: OrganizationsController;
  let organizationsService: OrganizationsService;
  let usersService: UsersService;

  // Mock users with different roles
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

  const mockOtherUser = {
    id: 'other-user-id',
    email: 'other@test.com',
  };

  const mockOrganization = {
    id: 'org-1',
    name: 'Test Organization',
    roles: {
      'owner-user-id': Role.OWNER,
      'admin-user-id': Role.ADMIN,
      'viewer-user-id': Role.VIEWER,
    },
  };

  const mockMember = {
    userId: 'other-user-id',
    role: Role.VIEWER,
    email: 'other@test.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [
        {
          provide: OrganizationsService,
          useValue: {
            getUserOrganizations: jest.fn(),
            getOrganizationWithRoles: jest.fn(),
            getUserRoleInOrganization: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            getOrganizationMembers: jest.fn(),
            addUserToOrganization: jest.fn(),
            updateUserRoleInOrganization: jest.fn(),
            removeUserFromOrganization: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
    organizationsService = module.get<OrganizationsService>(OrganizationsService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('Organization Name Updates - RBAC', () => {
    /**
     * Test 14: OWNER can update organization name
     * Verifies that users with OWNER role can update organization names
     */
    it('should allow OWNER to update organization name', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.OWNER);
      jest.spyOn(organizationsService, 'update').mockResolvedValue({ ...mockOrganization, name: 'Updated Name' } as any);
      jest.spyOn(organizationsService, 'getOrganizationWithRoles').mockResolvedValue(mockOrganization as any);

      const result = await controller.updateOrganization('org-1', { name: 'Updated Name' }, mockOwnerUser);

      expect(organizationsService.getUserRoleInOrganization).toHaveBeenCalledWith(
        mockOwnerUser.userId,
        'org-1'
      );
      expect(organizationsService.update).toHaveBeenCalledWith('org-1', 'Updated Name');
      expect(result).toBeDefined();
    });

    /**
     * Test 15: ADMIN can update organization name
     * Verifies that users with ADMIN role can update organization names
     */
    it('should allow ADMIN to update organization name', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.ADMIN);
      jest.spyOn(organizationsService, 'update').mockResolvedValue({ ...mockOrganization, name: 'Updated Name' } as any);
      jest.spyOn(organizationsService, 'getOrganizationWithRoles').mockResolvedValue(mockOrganization as any);

      const result = await controller.updateOrganization('org-1', { name: 'Updated Name' }, mockAdminUser);

      expect(organizationsService.getUserRoleInOrganization).toHaveBeenCalledWith(
        mockAdminUser.userId,
        'org-1'
      );
      expect(result).toBeDefined();
    });

    /**
     * Test 16: VIEWER cannot update organization name
     * Verifies that users with VIEWER role are forbidden from updating organization names
     */
    it('should prevent VIEWER from updating organization name', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.VIEWER);

      await expect(
        controller.updateOrganization('org-1', { name: 'Updated Name' }, mockViewerUser)
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.updateOrganization('org-1', { name: 'Updated Name' }, mockViewerUser)
      ).rejects.toThrow('Only owners and admins can update organization name');
      expect(organizationsService.update).not.toHaveBeenCalled();
    });
  });

  describe('Member Management - RBAC', () => {
    /**
     * Test 17: OWNER can add members to organization
     * Verifies that users with OWNER role can add new members
     */
    it('should allow OWNER to add members', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.OWNER);
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockOtherUser as any);
      jest.spyOn(organizationsService, 'addUserToOrganization').mockResolvedValue({} as any);
      jest.spyOn(organizationsService, 'getOrganizationMembers').mockResolvedValue([mockMember] as any);

      const result = await controller.addMember('org-1', { email: 'other@test.com', role: Role.VIEWER }, mockOwnerUser);

      expect(organizationsService.getUserRoleInOrganization).toHaveBeenCalledWith(
        mockOwnerUser.userId,
        'org-1'
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith('other@test.com');
      expect(organizationsService.addUserToOrganization).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    /**
     * Test 18: ADMIN can add members to organization
     * Verifies that users with ADMIN role can add new members
     */
    it('should allow ADMIN to add members', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.ADMIN);
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockOtherUser as any);
      jest.spyOn(organizationsService, 'addUserToOrganization').mockResolvedValue({} as any);
      jest.spyOn(organizationsService, 'getOrganizationMembers').mockResolvedValue([mockMember] as any);

      const result = await controller.addMember('org-1', { email: 'other@test.com', role: Role.VIEWER }, mockAdminUser);

      expect(organizationsService.getUserRoleInOrganization).toHaveBeenCalledWith(
        mockAdminUser.userId,
        'org-1'
      );
      expect(result).toBeDefined();
    });

    /**
     * Test 19: VIEWER cannot add members
     * Verifies that users with VIEWER role are forbidden from adding members
     */
    it('should prevent VIEWER from adding members', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.VIEWER);

      await expect(
        controller.addMember('org-1', { email: 'other@test.com', role: Role.VIEWER }, mockViewerUser)
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.addMember('org-1', { email: 'other@test.com', role: Role.VIEWER }, mockViewerUser)
      ).rejects.toThrow('Only owners and admins can add members');
      expect(organizationsService.addUserToOrganization).not.toHaveBeenCalled();
    });

    /**
     * Test 20: OWNER can update member roles
     * Verifies that users with OWNER role can update member roles
     */
    it('should allow OWNER to update member roles', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.OWNER);
      jest.spyOn(organizationsService, 'updateUserRoleInOrganization').mockResolvedValue({} as any);
      jest.spyOn(organizationsService, 'getOrganizationMembers').mockResolvedValue([mockMember] as any);

      const result = await controller.updateMemberRole(
        'org-1',
        'other-user-id',
        { role: Role.ADMIN },
        mockOwnerUser
      );

      expect(organizationsService.getUserRoleInOrganization).toHaveBeenCalledWith(
        mockOwnerUser.userId,
        'org-1'
      );
      expect(organizationsService.updateUserRoleInOrganization).toHaveBeenCalledWith(
        'org-1',
        'other-user-id',
        Role.ADMIN
      );
      expect(result).toBeDefined();
    });

    /**
     * Test 21: Users cannot change their own role
     * Verifies that users are prevented from modifying their own role (security measure)
     */
    it('should prevent users from changing their own role', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.OWNER);

      await expect(
        controller.updateMemberRole('org-1', 'owner-user-id', { role: Role.ADMIN }, mockOwnerUser)
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.updateMemberRole('org-1', 'owner-user-id', { role: Role.ADMIN }, mockOwnerUser)
      ).rejects.toThrow('You cannot change your own role');
      expect(organizationsService.updateUserRoleInOrganization).not.toHaveBeenCalled();
    });

    /**
     * Test 22: VIEWER cannot update member roles
     * Verifies that users with VIEWER role are forbidden from updating member roles
     */
    it('should prevent VIEWER from updating member roles', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.VIEWER);

      await expect(
        controller.updateMemberRole('org-1', 'other-user-id', { role: Role.ADMIN }, mockViewerUser)
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.updateMemberRole('org-1', 'other-user-id', { role: Role.ADMIN }, mockViewerUser)
      ).rejects.toThrow('Only owners and admins can update member roles');
    });

    /**
     * Test 23: OWNER can remove members
     * Verifies that users with OWNER role can remove members from organization
     */
    it('should allow OWNER to remove members', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.OWNER);
      jest.spyOn(organizationsService, 'removeUserFromOrganization').mockResolvedValue({} as any);
      jest.spyOn(organizationsService, 'getOrganizationMembers').mockResolvedValue([] as any);

      const result = await controller.removeMember('org-1', 'other-user-id', mockOwnerUser);

      expect(organizationsService.getUserRoleInOrganization).toHaveBeenCalledWith(
        mockOwnerUser.userId,
        'org-1'
      );
      expect(organizationsService.removeUserFromOrganization).toHaveBeenCalledWith(
        'org-1',
        'other-user-id'
      );
      expect(result).toBeDefined();
    });

    /**
     * Test 24: Users cannot remove themselves
     * Verifies that users are prevented from removing themselves from an organization
     */
    it('should prevent users from removing themselves', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.OWNER);

      await expect(
        controller.removeMember('org-1', 'owner-user-id', mockOwnerUser)
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.removeMember('org-1', 'owner-user-id', mockOwnerUser)
      ).rejects.toThrow('You cannot remove yourself from the organization');
      expect(organizationsService.removeUserFromOrganization).not.toHaveBeenCalled();
    });

    /**
     * Test 25: VIEWER cannot remove members
     * Verifies that users with VIEWER role are forbidden from removing members
     */
    it('should prevent VIEWER from removing members', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.VIEWER);

      await expect(
        controller.removeMember('org-1', 'other-user-id', mockViewerUser)
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.removeMember('org-1', 'other-user-id', mockViewerUser)
      ).rejects.toThrow('Only owners and admins can remove members');
    });
  });

  describe('Organization Creation - Access Control', () => {
    /**
     * Test 26: Any authenticated user can create organizations
     * Verifies that organization creation is not restricted by role in other organizations
     */
    it('should allow any authenticated user to create organizations', async () => {
      const newOrg = { id: 'org-new', name: 'New Organization' };
      jest.spyOn(organizationsService, 'create').mockResolvedValue(newOrg as any);
      jest.spyOn(organizationsService, 'addUserToOrganization').mockResolvedValue({} as any);
      jest.spyOn(organizationsService, 'getOrganizationWithRoles').mockResolvedValue({
        ...newOrg,
        roles: { 'viewer-user-id': Role.OWNER },
      } as any);

      // Even a VIEWER in another org can create a new organization
      const result = await controller.createOrganization({ name: 'New Organization' }, mockViewerUser);

      expect(organizationsService.create).toHaveBeenCalledWith('New Organization');
      expect(organizationsService.addUserToOrganization).toHaveBeenCalledWith(
        mockViewerUser.userId,
        'org-new',
        Role.OWNER
      );
      expect(result).toBeDefined();
    });
  });

  describe('Member List Access - RBAC', () => {
    /**
     * Test 27: All roles can view members (if they have access to organization)
     * Verifies that VIEWER, ADMIN, and OWNER can all view member lists
     */
    it('should allow VIEWER to view members if they have organization access', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(Role.VIEWER);
      jest.spyOn(organizationsService, 'getOrganizationMembers').mockResolvedValue([mockMember] as any);

      const result = await controller.getOrganizationMembers('org-1', mockViewerUser);

      expect(organizationsService.getUserRoleInOrganization).toHaveBeenCalledWith(
        mockViewerUser.userId,
        'org-1'
      );
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    /**
     * Test 28: Users without organization access cannot view members
     * Verifies that users without access to an organization cannot view its members
     */
    it('should prevent users without access from viewing members', async () => {
      jest.spyOn(organizationsService, 'getUserRoleInOrganization').mockResolvedValue(null);

      await expect(
        controller.getOrganizationMembers('org-1', mockOwnerUser)
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.getOrganizationMembers('org-1', mockOwnerUser)
      ).rejects.toThrow('You do not have access to this organization');
      expect(organizationsService.getOrganizationMembers).not.toHaveBeenCalled();
    });
  });
});

