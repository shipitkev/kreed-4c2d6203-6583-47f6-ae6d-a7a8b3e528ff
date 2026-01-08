import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToMany as TypeOrmOneToMany } from 'typeorm';
import { UserOrganization } from './user-organization.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => Organization, (org) => org.children)
  parent: Organization;

  @OneToMany(() => Organization, (org) => org.parent)
  children: Organization[];

  @TypeOrmOneToMany(() => UserOrganization, (userOrg) => userOrg.organization)
  userOrganizations: UserOrganization[];
}

