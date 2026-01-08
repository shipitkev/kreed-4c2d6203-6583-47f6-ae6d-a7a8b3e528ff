import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { UserOrganization } from '../../organizations/entities/user-organization.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Task, (task) => task.assignee)
  tasks: Task[];

  @OneToMany(() => UserOrganization, (userOrg) => userOrg.user)
  userOrganizations: UserOrganization[];
}
