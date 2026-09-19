-- CreateTable
CREATE TABLE "tenant_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "applicationId" TEXT NOT NULL,
    "accessPolicy" TEXT NOT NULL DEFAULT 'MEMBERS',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tenant_organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "tenant_applications_tenantId_idx" ON "tenant_applications"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_applications_tenantId_applicationId_key" ON "tenant_applications"("tenantId", "applicationId");

-- CreateIndex
CREATE INDEX "tenant_organizations_tenantId_idx" ON "tenant_organizations"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_organizations_parentId_idx" ON "tenant_organizations"("parentId");
