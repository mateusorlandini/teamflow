export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalTeams: number;
  activeMembers: number;
  completionRate: number;
  weeklyTrend: number;
}

export interface TaskTrendPoint {
  date: string;
  completed: number;
  created: number;
}

export interface TeamProductivityEntry {
  teamId: string;
  teamName: string;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  action: string;
  resourceType: 'task' | 'team' | 'comment';
  resourceId: string;
  resourceTitle: string;
  createdAt: string;
}

export interface UpcomingDeadline {
  taskId: string;
  title: string;
  dueDate: string;
  priority: string;
  assigneeId: string;
  daysUntilDue: number;
}
