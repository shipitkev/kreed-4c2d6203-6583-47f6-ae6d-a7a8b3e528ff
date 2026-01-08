import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { Organization } from './organizations/entities/organization.entity';
import { UserOrganization } from './organizations/entities/user-organization.entity';
import { OrganizationsService } from './organizations/organizations.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  // DEVELOPMENT ONLY - DELETE BEFORE PRODUCTION
  // Clears all data from the database
  @Get('clear')
  async clearDatabase() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Use TRUNCATE CASCADE to handle foreign key constraints
      // This will truncate all tables and cascade to dependent tables
      await queryRunner.query('TRUNCATE TABLE "user_organizations", "task", "user", "organization" CASCADE');

      await queryRunner.commitTransaction();
      
      return { message: 'Database cleared successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // DEVELOPMENT ONLY - Backfills existing tasks with a default organization
  @Get('backfill-tasks')
  async backfillTasks() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get or create a default organization
      const defaultOrg = await this.organizationsService.findOrCreateDefault();
      
      // Update all tasks without an organizationId
      await queryRunner.query(
        'UPDATE "task" SET "organizationId" = $1 WHERE "organizationId" IS NULL',
        [defaultOrg.id]
      );

      await queryRunner.commitTransaction();
      
      return { message: `Backfilled tasks with organization: ${defaultOrg.id}` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
