import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { Organization } from './organizations/entities/organization.entity';
import { UserOrganization } from './organizations/entities/user-organization.entity';
import { Logger } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.POSTGRES_USER || 'user',
      password: process.env.POSTGRES_PASSWORD || 'password',
      database: process.env.POSTGRES_DB || 'taskdb',
      entities: [User, Task, Organization, UserOrganization],
      synchronize: true,
        extra: {
          max: 10,
          connectionTimeoutMillis: 30000,
          idleTimeoutMillis: 30000,
        },
      logging: ['error', 'warn'],
    }),
    UsersModule,
    TasksModule,
    AuthModule,
    OrganizationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    Logger.log(`Database connection configured for: ${process.env.DB_HOST || 'postgres'}:${process.env.DB_PORT || '5432'}`);
  }
}
