-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN "tenantId" TEXT;

-- AlterTable
ALTER TABLE "batch_operations" ADD COLUMN "tenantId" TEXT;

-- AlterTable
ALTER TABLE "statistics_cache" ADD COLUMN "tenantId" TEXT;

-- AlterTable
ALTER TABLE "user_extends" ADD COLUMN "tenantId" TEXT;

-- AlterTable
ALTER TABLE "user_invitations" ADD COLUMN "tenantId" TEXT;

-- AlterTable
ALTER TABLE "user_notifications" ADD COLUMN "tenantId" TEXT;

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "settings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");

-- CreateIndex
CREATE INDEX "batch_operations_tenantId_idx" ON "batch_operations"("tenantId");

-- CreateIndex
CREATE INDEX "statistics_cache_tenantId_idx" ON "statistics_cache"("tenantId");

-- CreateIndex
CREATE INDEX "user_extends_tenantId_idx" ON "user_extends"("tenantId");

-- CreateIndex
CREATE INDEX "user_invitations_tenantId_idx" ON "user_invitations"("tenantId");

-- CreateIndex
CREATE INDEX "user_notifications_tenantId_idx" ON "user_notifications"("tenantId");
