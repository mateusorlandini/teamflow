export enum TaskPriority {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.Critical]: 'Critical',
  [TaskPriority.High]: 'High',
  [TaskPriority.Medium]: 'Medium',
  [TaskPriority.Low]: 'Low',
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.Critical]: '#ef4444',
  [TaskPriority.High]: '#f97316',
  [TaskPriority.Medium]: '#f59e0b',
  [TaskPriority.Low]: '#6b7280',
};

export const TASK_PRIORITY_ICONS: Record<TaskPriority, string> = {
  [TaskPriority.Critical]: 'emergency',
  [TaskPriority.High]: 'keyboard_double_arrow_up',
  [TaskPriority.Medium]: 'drag_handle',
  [TaskPriority.Low]: 'keyboard_double_arrow_down',
};
