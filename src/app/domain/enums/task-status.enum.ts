export enum TaskStatus {
  Backlog = 'backlog',
  Todo = 'todo',
  InProgress = 'in_progress',
  InReview = 'in_review',
  Done = 'done',
  Cancelled = 'cancelled',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Backlog]: 'Backlog',
  [TaskStatus.Todo]: 'To Do',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.InReview]: 'In Review',
  [TaskStatus.Done]: 'Done',
  [TaskStatus.Cancelled]: 'Cancelled',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.Backlog]: '#6b7280',
  [TaskStatus.Todo]: '#3b82f6',
  [TaskStatus.InProgress]: '#f59e0b',
  [TaskStatus.InReview]: '#8b5cf6',
  [TaskStatus.Done]: '#10b981',
  [TaskStatus.Cancelled]: '#ef4444',
};
