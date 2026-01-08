export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER',
}

export interface Organization {
  id: string;
  name: string;
  parentId?: string | null;
  children?: Organization[];
  roles?: Record<string, Role>; // Record<user_id, Role>
}

export interface User {
  id: string;
  email: string;
  password?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  assigneeId?: string;
  organizationId: string;
  assignee?: User;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

