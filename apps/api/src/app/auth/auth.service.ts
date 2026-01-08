import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private organizationsService: OrganizationsService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    // Get user's first organization (or we could let them select one)
    const organizations = await this.organizationsService.getUserOrganizations(user.id);
    const currentOrgId = organizations.length > 0 ? organizations[0].id : null;
    
    // Get user's role in the current organization
    const role = currentOrgId 
      ? await this.organizationsService.getUserRoleInOrganization(user.id, currentOrgId)
      : null;
    
    const payload = { 
      username: user.email, 
      sub: user.id, 
      role: role || 'VIEWER', // Default role if no org
      orgId: currentOrgId 
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }
}
