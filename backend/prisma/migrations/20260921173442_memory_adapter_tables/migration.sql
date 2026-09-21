-- CreateTable
CREATE TABLE "iam_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT,
    "primaryEmail" TEXT,
    "passwordHash" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "iam_organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "customData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "iam_memberships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "iam_org_roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "iam_org_role_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "iam_roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'User',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "iam_role_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "iam_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'spa',
    "secret" TEXT,
    "redirectUris" TEXT NOT NULL,
    "postLogoutRedirectUris" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "iam_users_username_key" ON "iam_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "iam_users_primaryEmail_key" ON "iam_users"("primaryEmail");

-- CreateIndex
CREATE INDEX "iam_memberships_userId_idx" ON "iam_memberships"("userId");

-- CreateIndex
CREATE INDEX "iam_memberships_organizationId_idx" ON "iam_memberships"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "iam_memberships_userId_organizationId_key" ON "iam_memberships"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "iam_org_roles_name_key" ON "iam_org_roles"("name");

-- CreateIndex
CREATE INDEX "iam_org_role_assignments_userId_organizationId_idx" ON "iam_org_role_assignments"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "iam_org_role_assignments_userId_organizationId_roleId_key" ON "iam_org_role_assignments"("userId", "organizationId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "iam_roles_name_key" ON "iam_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "iam_role_assignments_userId_roleId_key" ON "iam_role_assignments"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "iam_applications_secret_key" ON "iam_applications"("secret");
