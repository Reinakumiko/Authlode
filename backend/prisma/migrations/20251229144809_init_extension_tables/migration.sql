-- CreateTable
CREATE TABLE "user_invitations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "organizationId" TEXT,
    "roleIds" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "invitedBy" TEXT NOT NULL,
    "message" TEXT,
    "acceptedBy" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "acceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "userName" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "resourceName" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "executionTime" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_extends" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT,
    "department" TEXT,
    "position" TEXT,
    "managerId" TEXT,
    "workPhone" TEXT,
    "address" TEXT,
    "bio" TEXT,
    "customFields" TEXT,
    "preferences" TEXT,
    "lastLoginIp" TEXT,
    "lastLoginLocation" TEXT,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "internalTags" TEXT,
    "riskLevel" TEXT NOT NULL DEFAULT 'low',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "batch_operations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "success" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "fileUrl" TEXT,
    "errorFileUrl" TEXT,
    "resultSummary" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "user_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "statistics_cache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_invitations_token_key" ON "user_invitations"("token");

-- CreateIndex
CREATE INDEX "user_invitations_email_idx" ON "user_invitations"("email");

-- CreateIndex
CREATE INDEX "user_invitations_token_idx" ON "user_invitations"("token");

-- CreateIndex
CREATE INDEX "user_invitations_status_idx" ON "user_invitations"("status");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_extends_employeeId_key" ON "user_extends"("employeeId");

-- CreateIndex
CREATE INDEX "user_extends_department_idx" ON "user_extends"("department");

-- CreateIndex
CREATE INDEX "user_extends_managerId_idx" ON "user_extends"("managerId");

-- CreateIndex
CREATE INDEX "batch_operations_status_idx" ON "batch_operations"("status");

-- CreateIndex
CREATE INDEX "batch_operations_createdBy_idx" ON "batch_operations"("createdBy");

-- CreateIndex
CREATE INDEX "user_notifications_userId_idx" ON "user_notifications"("userId");

-- CreateIndex
CREATE INDEX "user_notifications_read_idx" ON "user_notifications"("read");

-- CreateIndex
CREATE UNIQUE INDEX "statistics_cache_key_key" ON "statistics_cache"("key");

-- CreateIndex
CREATE INDEX "statistics_cache_key_idx" ON "statistics_cache"("key");

-- CreateIndex
CREATE INDEX "statistics_cache_expiresAt_idx" ON "statistics_cache"("expiresAt");
