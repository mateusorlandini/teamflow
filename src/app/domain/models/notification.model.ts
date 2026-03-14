import { NotificationType } from '../enums/notification-type.enum';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;
  actorId: string | null;
  resourceType: 'task' | 'team' | 'comment' | 'system';
  resourceId: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export type CreateNotificationPayload = Omit<Notification, 'id' | 'createdAt' | 'readAt' | 'isRead'>;
