import { Controller, Post, Body, Get, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '@task-manager/auth';
import { Role } from '@task-manager/data';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private organizationsService: OrganizationsService
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: any) {
    // Get full user details from database
    const fullUser = await this.usersService.findOne(user.userId);
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...userWithoutPassword } = fullUser;
    return userWithoutPassword;
  }

  @Post('email-exists')
  async checkEmailExists(@Body() body: { email: string }) {
    const user = await this.usersService.findByEmail(body.email);
    if (user) {
      return { message: 'Account exists', exists: true };
    }
    return { message: 'Email available', exists: false };
  }

  @Post('login')
  async login(@Body() body) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    // Auto-create organization if not provided or doesn't exist
    let org;
    if (createUserDto.organizationId) {
      try {
        // Only try to find if it's a valid UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(createUserDto.organizationId)) {
          org = await this.organizationsService.findOne(createUserDto.organizationId);
        }
      } catch (error) {
        // If lookup fails, we'll create a new org below
        org = null;
      }
    }
    
    if (!org) {
      // Create a new organization for this user
      // Get the count of existing organizations and create "Org x" where x is count + 1
      const orgCount = await this.organizationsService.getOrganizationCount();
      org = await this.organizationsService.create(`Org ${orgCount + 1}`);
    }
    
    // Remove organizationId from DTO
    const { organizationId, ...userData } = createUserDto;
    const user = await this.usersService.create(userData);
    
    // Add user to organization as OWNER
    await this.organizationsService.addUserToOrganization(user.id, org.id, Role.OWNER);
    
    return { message: 'Sign up successful! Check your email for a verification link!', user };
  }
}
