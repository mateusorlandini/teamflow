import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  reporterId: string;
  teamId: string;
  labelIds: string[];
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  estimatedHours: number | null;
  loggedHours: number;
  position: number;
  checklist: ChecklistItem[];
  attachments: TaskAttachment[];
  tags: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
  createdAt?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  mentions: string[];
  reactions: CommentReaction[];
}

export interface CommentReaction {
  emoji: string;
  userIds: string[];
}

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  action: TaskActivityAction;
  field?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export type TaskActivityAction =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'priority_changed'
  | 'assigned'
  | 'unassigned'
  | 'commented'
  | 'checklist_updated'
  | 'due_date_changed'
  | 'label_added'
  | 'label_removed'
  | 'completed'
  | 'reopened';

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
  teamId: string;
}

export type CreateTaskPayload = Omit<
  Task,
  'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'loggedHours' | 'position'
>;
export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export interface TaskFilters {
  search?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeIds?: string[];
  labelIds?: string[];
  teamId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  overdue?: boolean;
}

export interface TaskMetrics {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
}
