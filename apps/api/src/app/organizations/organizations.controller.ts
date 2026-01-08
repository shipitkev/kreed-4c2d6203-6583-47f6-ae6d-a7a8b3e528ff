import { Controller, Get, Post, Patch, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '@task-manager/auth';
import { UsersService } from '../users/users.service';
import { Role } from '@task-manager/data';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(
    private organizationsService: OrganizationsService,
    private usersService: UsersService
  ) {}

  @Get()
  async getUserOrganizations(@CurrentUser() user: any) {
    // Return all organizations the user has access to
    // Pass currentOrgId from JWT for migration fallback
    const organizations = await this.organizationsService.getUserOrganizations(user.userId, user.organizationId);
    
    // Get roles for each organization and format response
    const orgsWithRoles = await Promise.all(
      organizations.map(async (org) => {
        const orgWithRoles = await this.organizationsService.getOrganizationWithRoles(org.id);
        return orgWithRoles;
      })
    );
    
    return orgsWithRoles;
  }

  @Post()
  async createOrganization(
    @Body() body: { name: string },
    @CurrentUser() user: any
  ) {
    // Create the organization
    const org = await this.organizationsService.create(body.name);
    
    // Add user as OWNER of the new organization
    const userOrg = await this.organizationsService.addUserToOrganization(user.userId, org.id, Role.OWNER);
    
    // Verify the relationship was created successfully
    if (!userOrg) {
      throw new Error('Failed to add user to organization');
    }
    
    // Double-check the relationship exists before returning
    const verifyRole = await this.organizationsService.getUserRoleInOrganization(user.userId, org.id);
    if (!verifyRole) {
      console.error(`[ERROR] User ${user.userId} was not properly added to organization ${org.id} as OWNER`);
      throw new Error('Failed to verify user-organization relationship');
    }
    
    // Return organization with roles
    return this.organizationsService.getOrganizationWithRoles(org.id);
  }

  @Get(':id/members')
  async getOrganizationMembers(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    // Check user has access to this organization
    const userRole = await this.organizationsService.getUserRoleInOrganization(user.userId, id);
    if (!userRole) {
      throw new ForbiddenException('You do not have access to this organization');
    }

    return this.organizationsService.getOrganizationMembers(id);
  }

  @Patch(':id/members/:userId/role')
  async updateMemberRole(
    @Param('id') organizationId: string,
    @Param('userId') userId: string,
    @Body() body: { role: Role },
    @CurrentUser() user: any
  ) {
    // Check user's role in this organization
    const userRole = await this.organizationsService.getUserRoleInOrganization(user.userId, organizationId);
    
    if (!userRole) {
      throw new ForbiddenException('You do not have access to this organization');
    }

    if (userRole !== Role.OWNER && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only owners and admins can update member roles');
    }

    // Prevent users from changing their own role (security measure)
    if (userId === user.userId) {
      throw new ForbiddenException('You cannot change your own role');
    }

    await this.organizationsService.updateUserRoleInOrganization(organizationId, userId, body.role);
    
    // Return updated members list
    return this.organizationsService.getOrganizationMembers(organizationId);
  }

  @Patch(':id/members/:userId/remove')
  async removeMember(
    @Param('id') organizationId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any
  ) {
    // Check user's role in this organization
    const userRole = await this.organizationsService.getUserRoleInOrganization(user.userId, organizationId);
    
    if (!userRole) {
      throw new ForbiddenException('You do not have access to this organization');
    }

    if (userRole !== Role.OWNER && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only owners and admins can remove members');
    }

    // Prevent users from removing themselves
    if (userId === user.userId) {
      throw new ForbiddenException('You cannot remove yourself from the organization');
    }

    await this.organizationsService.removeUserFromOrganization(organizationId, userId);
    
    // Return updated members list
    return this.organizationsService.getOrganizationMembers(organizationId);
  }

  @Post(':id/members')
  async addMember(
    @Param('id') organizationId: string,
    @Body() body: { email: string; role: Role },
    @CurrentUser() user: any
  ) {
    // Check user's role in this organization
    const userRole = await this.organizationsService.getUserRoleInOrganization(user.userId, organizationId);
    
    if (!userRole) {
      throw new ForbiddenException('You do not have access to this organization');
    }

    if (userRole !== Role.OWNER && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only owners and admins can add members');
    }

    // Find user by email
    const targetUser = await this.usersService.findByEmail(body.email);
    if (!targetUser) {
      throw new ForbiddenException('User with this email does not exist');
    }

    // Add user to organization
    await this.organizationsService.addUserToOrganization(targetUser.id, organizationId, body.role);
    
    // Return updated members list
    return this.organizationsService.getOrganizationMembers(organizationId);
  }

  @Patch(':id')
  async updateOrganization(
    @Param('id') id: string,
    @Body() body: { name: string },
    @CurrentUser() user: any
  ) {
    // Check user's role in this organization
    const userRole = await this.organizationsService.getUserRoleInOrganization(user.userId, id);
    
    if (!userRole) {
      throw new ForbiddenException('You do not have access to this organization');
    }

    if (userRole !== Role.OWNER && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only owners and admins can update organization name');
    }

    const updatedOrg = await this.organizationsService.update(id, body.name);
    
    // Return organization with roles
    return this.organizationsService.getOrganizationWithRoles(updatedOrg.id);
  }
}

