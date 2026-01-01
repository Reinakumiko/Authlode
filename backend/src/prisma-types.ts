/**
 * Temporary Prisma type definitions
 * This is a workaround for Windows Prisma Client generation issue
 * TODO: Generate proper Prisma Client once Windows spawn issue is resolved
 */

// Model types
export interface AuditLog {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  resourceName: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  errorMessage: string | null;
  executionTime: number | null;
  createdAt: Date;
}

export interface UserInvitation {
  id: string;
  email: string;
  token: string;
  organizationId: string | null;
  roleIds: string;
  status: string;
  invitedBy: string;
  message: string | null;
  acceptedBy: string | null;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserExtend {
  userId: string;
  employeeId: string | null;
  department: string | null;
  position: string | null;
  managerId: string | null;
  workPhone: string | null;
  address: string | null;
  bio: string | null;
  customFields: string | null;
  preferences: string | null;
  lastLoginIp: string | null;
  lastLoginLocation: string | null;
  profileCompleted: boolean;
  notes: string | null;
  internalTags: string | null;
  riskLevel: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchOperation {
  id: string;
  type: string;
  status: string;
  total: number;
  processed: number;
  success: number;
  failed: number;
  fileUrl: string | null;
  errorFileUrl: string | null;
  resultSummary: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  readAt: Date | null;
  metadata: string | null;
  createdAt: Date;
}

export interface StatisticsCache {
  id: string;
  key: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Prisma namespace types
export namespace PrismaTypes {
  export type AuditLogCreateInput = Partial<AuditLog> & { id?: string };
  export type AuditLogUpdateInput = Partial<AuditLog>;
  export type AuditLogWhereInput = any;
  export type UserInvitationCreateInput = Partial<UserInvitation> & { id?: string };
  export type UserInvitationUpdateInput = Partial<UserInvitation>;
  export type UserInvitationWhereInput = any;
  export type UserExtendCreateInput = Partial<UserExtend> & { userId: string };
  export type UserExtendUpdateInput = Partial<UserExtend>;
  export type UserExtendWhereInput = any;
  export type BatchOperationCreateInput = Partial<BatchOperation> & { id?: string };
  export type BatchOperationUpdateInput = Partial<BatchOperation>;
  export type BatchOperationWhereInput = any;
  export type UserNotificationCreateInput = Partial<UserNotification> & { id?: string };
  export type UserNotificationUpdateInput = Partial<UserNotification>;
  export type UserNotificationWhereInput = any;
  export type StatisticsCacheCreateInput = Partial<StatisticsCache> & { id?: string };
  export type StatisticsCacheUpdateInput = Partial<StatisticsCache>;
  export type StatisticsCacheWhereInput = any;
}
