import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from './organization.entity';

@Entity('user_organizations')
@Unique(['userId', 'organizationId'])
export class UserOrganization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  organizationId: string;

  @Column()
  role: string; // 'OWNER', 'ADMIN', 'VIEWER'

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}

