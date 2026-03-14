import { UserRole } from '../enums/user-role.enum';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  teamIds: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  expiresAt: number;
}

export interface Permission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

export type PermissionResource =
  | 'tasks'
  | 'teams'
  | 'users'
  | 'reports'
  | 'settings'
  | 'notifications';

export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'manage';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.Admin]: [
    { resource: 'tasks', actions: ['read', 'create', 'update', 'delete', 'manage'] },
    { resource: 'teams', actions: ['read', 'create', 'update', 'delete', 'manage'] },
    { resource: 'users', actions: ['read', 'create', 'update', 'delete', 'manage'] },
    { resource: 'reports', actions: ['read', 'create', 'manage'] },
    { resource: 'settings', actions: ['read', 'update', 'manage'] },
    { resource: 'notifications', actions: ['read', 'manage'] },
  ],
  [UserRole.Manager]: [
    { resource: 'tasks', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'teams', actions: ['read', 'create', 'update'] },
    { resource: 'users', actions: ['read'] },
    { resource: 'reports', actions: ['read', 'create'] },
    { resource: 'settings', actions: ['read'] },
    { resource: 'notifications', actions: ['read'] },
  ],
  [UserRole.Member]: [
    { resource: 'tasks', actions: ['read', 'create', 'update'] },
    { resource: 'teams', actions: ['read'] },
    { resource: 'users', actions: ['read'] },
    { resource: 'reports', actions: ['read'] },
    { resource: 'settings', actions: ['read'] },
    { resource: 'notifications', actions: ['read'] },
  ],
};
