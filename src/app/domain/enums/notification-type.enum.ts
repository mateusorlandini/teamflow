export enum NotificationType {
  TaskAssigned = 'task_assigned',
  TaskDeadline = 'task_deadline',
  TaskCompleted = 'task_completed',
  TaskComment = 'task_comment',
  TaskMention = 'task_mention',
  TeamInvite = 'team_invite',
  SystemAlert = 'system_alert',
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.TaskAssigned]: 'Task Assigned',
  [NotificationType.TaskDeadline]: 'Deadline Approaching',
  [NotificationType.TaskCompleted]: 'Task Completed',
  [NotificationType.TaskComment]: 'New Comment',
  [NotificationType.TaskMention]: 'You were mentioned',
  [NotificationType.TeamInvite]: 'Team Invitation',
  [NotificationType.SystemAlert]: 'System Alert',
};

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  [NotificationType.TaskAssigned]: 'assignment_ind',
  [NotificationType.TaskDeadline]: 'schedule',
  [NotificationType.TaskCompleted]: 'task_alt',
  [NotificationType.TaskComment]: 'comment',
  [NotificationType.TaskMention]: 'alternate_email',
  [NotificationType.TeamInvite]: 'group_add',
  [NotificationType.SystemAlert]: 'notifications_active',
};
