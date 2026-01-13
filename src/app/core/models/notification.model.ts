// Notification model
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  data?: any;
  createdAt: string;
}

export enum NotificationType {
  LOAN_SUBMITTED = 'LOAN_SUBMITTED',
  LOAN_REVIEWED = 'LOAN_REVIEWED',
  LOAN_APPROVED = 'LOAN_APPROVED',
  LOAN_REJECTED = 'LOAN_REJECTED',
  LOAN_DISBURSED = 'LOAN_DISBURSED',
  SYSTEM = 'SYSTEM',
  INFO = 'INFO'
}

// Notification count
export interface NotificationCount {
  total: number;
  unread: number;
}
