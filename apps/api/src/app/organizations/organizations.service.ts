import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { UserOrganization } from './entities/user-organization.entity';
import { Role } from '@task-manager/data';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
    @InjectRepository(UserOrganization)
    private userOrganizationRepository: Repository<UserOrganization>,
  ) {}

  async create(name: string, parentId?: string): Promise<Organization> {
    const org = this.organizationsRepository.create({ name, parentId });
    return this.organizationsRepository.save(org);
  }

  async findOne(id: string): Promise<Organization | null> {
    return this.organizationsRepository.findOneBy({ id });
  }

  async getOrganizationCount(): Promise<number> {
    return await this.organizationsRepository.count();
  }

  async findOrCreateDefault(): Promise<Organization> {
    // Try to find a default organization
    let org = await this.organizationsRepository.findOne({ where: { name: 'Default Organization' } });
    
    if (!org) {
      org = await this.create('Default Organization');
    }
    
    return org;
  }

  async update(id: string, name: string): Promise<Organization> {
    const org = await this.findOne(id);
    if (!org) {
      throw new Error('Organization not found');
    }
    org.name = name;
    return this.organizationsRepository.save(org);
  }

  async addUserToOrganization(userId: string, organizationId: string, role: Role): Promise<UserOrganization> {
    // Check if relationship already exists
    let userOrg = await this.userOrganizationRepository.findOne({
      where: { userId, organizationId },
    });

    if (userOrg) {
      // Update existing role
      userOrg.role = role;
      return this.userOrganizationRepository.save(userOrg);
    }

    // Create new relationship
    userOrg = this.userOrganizationRepository.create({
      userId,
      organizationId,
      role,
    });
    const saved = await this.userOrganizationRepository.save(userOrg);
    
    // Verify it was saved correctly
    const verify = await this.userOrganizationRepository.findOne({
      where: { userId, organizationId },
    });
    
    if (!verify) {
      throw new Error(`Failed to save UserOrganization relationship: userId=${userId}, organizationId=${organizationId}, role=${role}`);
    }
    
    return saved;
  }

  async getUserOrganizations(userId: string, currentOrgId?: string): Promise<Organization[]> {
    // First, try to get organizations from UserOrganization join table
    const userOrgs = await this.userOrganizationRepository.find({
      where: { userId },
      relations: ['organization'],
    });
    
    if (userOrgs.length > 0) {
      return userOrgs.map(uo => uo.organization);
    }
    
    // Fallback: If no UserOrganization entries exist (migration scenario),
    // find organizations from tasks where user is assignee, or from currentOrgId in JWT
    const { Task } = await import('../tasks/entities/task.entity');
    const taskRepository = this.organizationsRepository.manager.getRepository(Task);
    
    // Find tasks where user is assignee
    const assignedTasks = await taskRepository.find({
      where: { assigneeId: userId },
      select: ['organizationId'],
    });
    
    // Get unique organization IDs from assigned tasks
    let orgIds = [...new Set(assignedTasks.map(t => t.organizationId).filter(Boolean))];
    
    // Also include currentOrgId from JWT if provided
    if (currentOrgId && !orgIds.includes(currentOrgId)) {
      orgIds.push(currentOrgId);
    }
    
    // If still no orgs found, find all unique orgs from all tasks (migration fallback)
    if (orgIds.length === 0) {
      const allTasks = await taskRepository.find({
        select: ['organizationId'],
      });
      orgIds = [...new Set(allTasks.map(t => t.organizationId).filter(Boolean))];
    }
    
    if (orgIds.length === 0) {
      return [];
    }
    
    // Find the organizations
    const organizations = await this.organizationsRepository.find({
      where: orgIds.map(id => ({ id })),
    });
    
    // Create UserOrganization entries for these organizations
    // For existing data, we'll make the user OWNER of organizations they have tasks in
    for (const org of organizations) {
      const existing = await this.userOrganizationRepository.findOne({
        where: { userId, organizationId: org.id },
      });
      
      if (!existing) {
        await this.addUserToOrganization(userId, org.id, Role.OWNER);
      }
    }
    
    // Return the organizations with fresh UserOrganization entries
    const updatedUserOrgs = await this.userOrganizationRepository.find({
      where: { userId },
      relations: ['organization'],
    });
    
    return updatedUserOrgs.map(uo => uo.organization);
  }

  async getUserRoleInOrganization(userId: string, organizationId: string): Promise<Role | null> {
    const userOrg = await this.userOrganizationRepository.findOne({
      where: { userId, organizationId },
    });
    
    if (!userOrg) {
      // Debug logging to help diagnose issues
      console.log(`[DEBUG] getUserRoleInOrganization: No UserOrganization found for userId=${userId}, organizationId=${organizationId}`);
      // Check if organization exists
      const org = await this.findOne(organizationId);
      if (!org) {
        console.log(`[DEBUG] Organization ${organizationId} does not exist`);
      } else {
        // Check all user-org relationships for this org
        const allUserOrgs = await this.userOrganizationRepository.find({
          where: { organizationId },
        });
        console.log(`[DEBUG] Organization ${organizationId} has ${allUserOrgs.length} user relationships:`, allUserOrgs.map(uo => ({ userId: uo.userId, role: uo.role })));
      }
    }
    
    return userOrg ? (userOrg.role as Role) : null;
  }

  async getOrganizationWithRoles(organizationId: string): Promise<Organization & { roles: Record<string, Role> }> {
    const org = await this.findOne(organizationId);
    if (!org) {
      throw new Error('Organization not found');
    }

    const userOrgs = await this.userOrganizationRepository.find({
      where: { organizationId },
    });

    const roles: Record<string, Role> = {};
    userOrgs.forEach(uo => {
      roles[uo.userId] = uo.role as Role;
    });

    return { ...org, roles };
  }

  async getOrganizationMembers(organizationId: string) {
    const userOrgs = await this.userOrganizationRepository.find({
      where: { organizationId },
    });

    // Get user details for each member
    const { User } = await import('../users/entities/user.entity');
    const userRepository = this.organizationsRepository.manager.getRepository(User);
    
    const members = await Promise.all(
      userOrgs.map(async (uo) => {
        const user = await userRepository.findOne({ where: { id: uo.userId } });
        return {
          userId: uo.userId,
          role: uo.role,
          email: user?.email || null,
        };
      })
    );

    return members;
  }

  async updateUserRoleInOrganization(organizationId: string, userId: string, role: Role) {
    const userOrg = await this.userOrganizationRepository.findOne({
      where: { userId, organizationId },
    });

    if (!userOrg) {
      throw new Error('User is not a member of this organization');
    }

    userOrg.role = role;
    return this.userOrganizationRepository.save(userOrg);
  }

  async removeUserFromOrganization(organizationId: string, userId: string) {
    const userOrg = await this.userOrganizationRepository.findOne({
      where: { userId, organizationId },
    });

    if (!userOrg) {
      throw new Error('User is not a member of this organization');
    }

    return this.userOrganizationRepository.remove(userOrg);
  }
}
