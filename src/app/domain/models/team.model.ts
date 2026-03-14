export interface Team {
  id: string;
  name: string;
  description: string;
  avatarColor: string;
  avatarInitials: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  settings: TeamSettings;
}

export interface TeamSettings {
  allowMembersToCreateTasks: boolean;
  allowMembersToInvite: boolean;
  defaultTaskStatus: string;
  taskLabelIds: string[];
}

export interface TeamMember {
  userId: string;
  teamId: string;
  role: 'owner' | 'manager' | 'member';
  joinedAt: string;
}

export interface TeamMetrics {
  teamId: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  avgCompletionDays: number;
  memberProductivity: MemberProductivity[];
}

export interface MemberProductivity {
  userId: string;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
}

export type CreateTeamPayload = Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'avatarInitials'>;
export type UpdateTeamPayload = Partial<CreateTeamPayload>;
