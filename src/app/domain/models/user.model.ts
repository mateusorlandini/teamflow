import { UserRole } from '../enums/user-role.enum';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  jobTitle: string;
  department: string;
  teamIds: string[];
  isActive: boolean;
  createdAt: string;
  lastActiveAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationPreferences;
  dashboardLayout: 'compact' | 'comfortable';
}

export interface NotificationPreferences {
  taskAssigned: boolean;
  taskDeadline: boolean;
  taskComment: boolean;
  taskMention: boolean;
  teamUpdates: boolean;
  emailDigest: boolean;
}

export interface UserProfile extends User {
  bio?: string;
  phone?: string;
  timezone: string;
  completedTasks: number;
  inProgressTasks: number;
  totalTasks: number;
}

export type CreateUserPayload = Omit<User, 'id' | 'createdAt' | 'lastActiveAt'>;
export type UpdateUserPayload = Partial<CreateUserPayload>;
