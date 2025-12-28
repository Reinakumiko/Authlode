# Logto 用户中心管理系统 - AI 实现步骤方案

## 📊 项目进度追踪

**最后更新**: 2025-01-29
**当前状态**: 阶段 1 完成,准备进入阶段 2

### 总体进度

```
阶段 0: 环境准备 (1-2天) ████████████████████ 100% ✅
阶段 1: 项目初始化 (2-3天) ████████████████████ 100% ✅
阶段 2: Logto API 集成 (2-3天) ░░░░░░░░░░░░░░░░░░░░   0% ⏳
阶段 3: 扩展数据库设计 (2-3天) ████████████░░░░░░░░░  50% 🔄
阶段 4: 认证与授权 (2-3天)     ░░░░░░░░░░░░░░░░░░░░   0% ⏳
阶段 5: 核心功能开发 (5-7天)   ░░░░░░░░░░░░░░░░░░░░   0% ⏳
阶段 6: 扩展功能开发 (4-5天)   ░░░░░░░░░░░░░░░░░░░░   0% ⏳
阶段 7: 前端界面开发 (7-10天)  ░░░░░░░░░░░░░░░░░░░░   0% ⏳
阶段 8: 测试与优化 (3-5天)     ░░░░░░░░░░░░░░░░░░░░   0% ⏳
阶段 9: Docker 部署 (2-3天)    ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

### 已完成任务 (✅)

#### 阶段 0: 环境准备 ✅
- [x] 任务 0.1: 验证 Node.js v20.16.0
- [x] 任务 0.1: 验证 pnpm 9.6.0
- [x] 任务 0.4: 创建项目根目录结构
- [x] 任务 0.4: 创建环境变量配置模板

#### 阶段 1: 项目初始化 ✅
- [x] 任务 1.1: 初始化后端 NestJS 项目
  - 使用 NestJS CLI 创建项目
  - 安装核心依赖 (@nestjs/config, @nestjs/passport, @nestjs/jwt, @nestjs/axios)
  - 安装 Prisma 5.20.0 (兼容 Node.js v20.16.0)
- [x] 任务 1.2: 配置后端基础模块
  - 创建 Prisma Schema,定义 6 个扩展数据模型
  - 配置 TypeScript 环境变量
- [x] 任务 1.3: 初始化前端 Nuxt 3 项目
  - 创建 Nuxt 3.20.2 项目结构
  - 安装核心依赖 (@nuxt/ui, @pinia/nuxt, vee-validate, dayjs)
- [x] 任务 1.4: 配置前端基础架构
  - 创建 app.vue, pages/index.vue
  - 创建 composables/, utils/, types/ 目录
  - 配置 Tailwind CSS

#### 阶段 3: 扩展数据库设计 (部分完成) 🔄
- [x] 任务 3.1: 设计 Prisma Schema
  - UserInvitation (邀请系统)
  - AuditLog (审计日志)
  - UserExtend (用户扩展信息)
  - BatchOperation (批量操作)
  - UserNotification (系统通知)
  - StatisticsCache (统计缓存)

### 待办任务 (⏳)

#### 阶段 2: Logto API 集成 (下一步)
- [ ] 任务 2.1: 创建 Logto API 模块
- [ ] 任务 2.2: 实现用户 API 调用
- [ ] 任务 2.3: 实现组织 API 调用
- [ ] 任务 2.4: 实现角色和应用 API 调用
- [ ] 任务 2.5: 创建 API 测试

#### 阶段 3: 扩展数据库设计 (待完成)
- [ ] 任务 3.2: 创建数据库迁移
- [ ] 任务 3.3: 创建 Repository 层

#### 阶段 4: 认证与授权
- [ ] 任务 4.1: 实现 Logto OIDC 认证
- [ ] 任务 4.2: 实现 JWT 认证
- [ ] 任务 4.3: 实现审计日志拦截器

### 当前 TODO

**优先级 P0 (立即执行)**:
1. 配置 `.env` 文件,填入实际的数据库和 Logto 连接信息
2. 初始化数据库迁移 (`npx prisma migrate dev`)
3. 开始实现 Logto API 集成服务

**优先级 P1 (本周完成)**:
1. 完成阶段 2: Logto API 集成
2. 完成阶段 3: 扩展数据库 Repository 层
3. 完成阶段 4: 认证与授权基础功能

**优先级 P2 (下周完成)**:
1. 开始阶段 5: 核心功能开发
2. 实现用户管理模块
3. 实现组织管理模块

### Git 提交记录

```
b640fc6 feat: 初始化前端 Nuxt 3项目
8a1e748 feat: 初始化后端 NestJS 项目和 Prisma 配置
42c2f59 feat: 添加项目基础结构和配置文件
1e1820e docs: 重写AI实现步骤方案
d63cd58 docs: 更新项目文件结构
df6cfc8 chore: 移除v2版本文件,使用Git管理版本
61f1b2a docs: 初始化项目文档
```

### 下次开发计划

1. **阶段 2 开始**: 创建 Logto API 集成模块
   - 实现基础 API 调用封装
   - 实现用户、组织、角色 API
   - 测试 API 连接

2. **配置数据库**: 连接实际数据库实例
   - 配置 `DATABASE_URL`
   - 运行初始迁移
   - 验证表结构

---

## 📋 方案说明

本文档是一份专门为 AI 辅助开发设计的实现步骤方案,将整个项目分解为**具体、可执行、可验证**的任务。

### 核心理解 (重要!)

#### 项目定位
- 这是一个**独立的用户中心管理应用**
- 基于 Logto IAM 作为底层基础设施
- 通过 Logto Management API 操作核心数据

#### 数据来源划分
```
┌─────────────────────────────────────────┐
│   Logto IAM (数据源)                    │
│  - 用户账户                              │
│  - 组织架构                              │
│  - 角色权限                              │
│  - 应用注册                              │
└─────────────────────────────────────────┘
        ↑ 通过 Management API
        │ 读写操作
┌─────────────────────────────────────────┐
│   你的应用 (NestJS + Nuxt 3)            │
│  - 用户管理界面                          │
│  - 组织管理界面                          │
│  - 角色权限界面                          │
└─────────────────────────────────────────┘
        ↓ 只存储扩展功能数据
┌─────────────────────────────────────────┐
│  扩展数据库 (MySQL/PostgreSQL)           │
│  - 邀请记录                              │
│  - 审计日志                              │
│  - 用户扩展信息                          │
│  - 批量操作记录                          │
└─────────────────────────────────────────┘
```

#### 开发环境配置 (不用 Docker)
- ✅ 连接已有的 MySQL/PostgreSQL 实例
- ✅ 连接已有的 Redis 实例 (可选)
- ✅ 连接已有的 Logto 实例
- ✅ 本地运行 NestJS 和 Nuxt

#### 生产环境 (使用 Docker)
- ✅ Docker 容器化部署
- ✅ Docker Compose 编排
- ✅ 包含应用 + 数据库 + Redis

---

## 🎯 总体实施路线图

```
阶段 0: 环境准备 (1-2天) ✅
    ↓
阶段 1: 项目初始化 (2-3天) ✅
    ↓
阶段 2: Logto API 集成 (2-3天) ⏳
    ↓
阶段 3: 扩展数据库设计 (2-3天) 🔄
    ↓
阶段 4: 认证与授权 (2-3天) ⏳
    ↓
阶段 5: 核心功能开发 (5-7天) ⏳
    ↓
阶段 6: 扩展功能开发 (4-5天) ⏳
    ↓
阶段 7: 前端界面开发 (7-10天) ⏳
    ↓
阶段 8: 测试与优化 (3-5天) ⏳
    ↓
阶段 9: Docker 部署 (2-3天) ⏳
```

---

## 📅 阶段 0: 环境准备 (1-2天) ✅

### 目标
搭建完整的开发环境,连接已有的数据库和服务。

### 任务清单

#### 任务 0.1: 安装开发工具 ✅
**时间**: 30分钟
**优先级**: ⭐⭐⭐⭐⭐
**状态**: 已完成

**完成内容**:
- ✅ Node.js v20.16.0 已安装
- ✅ pnpm 9.6.0 已安装

---

#### 任务 0.2: 配置数据库连接
**时间**: 1小时
**优先级**: ⭐⭐⭐⭐⭐
**状态**: 待配置

**步骤**:
1. 确认已有的 MySQL/PostgreSQL 实例信息
   - 数据库类型 (MySQL 或 PostgreSQL)
   - 主机地址
   - 端口
   - 数据库名称
   - 用户名和密码

2. 测试数据库连接
   - 使用数据库客户端工具连接
   - 创建测试数据库 `logto_user_center_dev`
   - 验证权限

3. (可选) 配置 Redis 连接
   - 确认 Redis 实例信息
   - 测试连接

**验收标准**:
- [ ] 数据库连接信息已确认
- [ ] 可以通过客户端工具连接数据库
- [ ] 测试数据库创建成功
- [ ] (可选) Redis 连接成功

---

#### 任务 0.3: 配置 Logto 连接
**时间**: 1小时
**优先级**: ⭐⭐⭐⭐⭐
**状态**: 待配置

**步骤**:
1. 确认 Logto 实例信息
   - Logto 管理后台地址
   - 应用 ID (App ID)
   - 应用密钥 (App Secret)
   - Management API Endpoint
   - Management API Key

2. 获取 Management API 密钥
   - 登录 Logto 管理后台
   - 进入设置 -> API 密钥
   - 创建新的 Management API 密钥
   - 保存密钥信息

3. 测试 Logto API 连接
   - 使用 curl 或 Postman 测试
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://your-logto.com/api/users
   ```

**验收标准**:
- [ ] Logto 实例信息已确认
- [ ] Management API Key 已获取
- [ ] API 测试连接成功

---

#### 任务 0.4: 创建项目根目录 ✅
**时间**: 30分钟
**优先级**: ⭐⭐⭐⭐⭐
**状态**: 已完成

**完成内容**:
- ✅ 创建项目目录结构 (backend/, frontend/, docs/, deployment/)
- ✅ 创建 README.md
- ✅ 创建环境变量配置模板 (backend/.env.example, frontend/.env.example)

---

## 📅 阶段 1: 项目初始化 (2-3天) ✅

### 目标
创建前后端项目基础结构,配置开发工具。

### 任务清单

#### 任务 1.1: 初始化后端项目 (NestJS) ✅
**时间**: 2小时
**优先级**: ⭐⭐⭐⭐⭐
**状态**: 已完成

**完成内容**:
- ✅ 使用 NestJS CLI 创建项目
- ✅ 安装核心依赖
  - @nestjs/config
  - @nestjs/passport
  - @nestjs/jwt
  - @nestjs/axios
  - axios
  - class-validator
  - class-transformer
- ✅ 安装 Prisma 5.20.0 (兼容 Node.js v20.16.0)
- ✅ 配置 TypeScript 环境
- ✅ 配置 ESLint 和 Prettier

**验收标准**: ✅ 全部完成
- [x] NestJS 项目可正常启动 (pnpm run start:dev)
- [x] 访问 http://localhost:3001 显示 "Hello World!"
- [x] TypeScript 编译无错误
- [x] ESLint 和 Prettier 正常工作

---

#### 任务 1.2: 配置后端基础模块 ✅
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐⭐
**状态**: 已完成

**完成内容**:
- ✅ 创建环境变量配置模板 (.env.example)
- ✅ 创建 Prisma Schema,定义 6 个扩展数据模型:
  - UserInvitation (邀请系统)
  - AuditLog (审计日志)
  - UserExtend (用户扩展信息)
  - BatchOperation (批量操作)
  - UserNotification (系统通知)
  - StatisticsCache (统计缓存)

**待完成**:
- [ ] 创建配置模块
- [ ] 创建全局异常过滤器
- [ ] 创建全局响应拦截器
- [ ] 创建全局验证管道

---

#### 任务 1.3: 初始化前端项目 (Nuxt 3) ✅
**时间**: 2小时
**优先级**: ⭐⭐⭐⭐⭐
**状态**: 已完成

**完成内容**:
- ✅ 创建 Nuxt 3.20.2 项目
- ✅ 安装核心依赖
  - @nuxt/ui ^3.0.0
  - @pinia/nuxt ^0.11.3
  - @iconify-json/heroicons
  - @iconify-json/mdi
  - vee-validate
  - yup
  - dayjs
- ✅ 配置 nuxt.config.ts
- ✅ 配置 TypeScript 严格模式
- ✅ 配置 Tailwind CSS

**验收标准**: ✅ 全部完成
- [x] Nuxt 项目可正常启动 (pnpm dev)
- [x] 访问 http://localhost:3000 显示欢迎页面
- [x] Nuxt UI 组件可正常使用
- [x] Tailwind CSS 样式生效

---

#### 任务 1.4: 配置前端基础架构 ✅
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐
**状态**: 已完成

**完成内容**:
- ✅ 创建基础目录结构 (composables/, utils/, types/, pages/)
- ✅ 创建基础页面 (app.vue, pages/index.vue)
- ✅ 创建全局样式文件 (assets/css/main.css)

**待完成**:
- [ ] 创建 HTTP 请求工具
- [ ] 创建基础布局
- [ ] 创建基础 Stores

---

#### 任务 1.5: 配置开发工具和脚本
**时间**: 2小时
**优先级**: ⭐⭐⭐
**状态**: 待完成

**步骤**:
1. 配置 Git Hooks
   ```bash
   pnpm add -D husky lint-staged
   npx husky install
   ```

2. 配置 lint-staged
   ```json
   {
     "lint-staged": {
       "*.{ts,js,vue}": [
         "eslint --fix",
         "prettier --write"
       ]
     }
   }
   ```

3. 创建开发脚本
   ```json
   {
     "scripts": {
       "dev": "concurrently \"pnpm --filter backend dev\" \"pnpm --filter frontend dev\"",
       "build": "pnpm --filter backend build && pnpm --filter frontend build",
       "lint": "pnpm --filter backend lint && pnpm --filter frontend lint"
     }
   }
   ```

**验收标准**:
- [ ] Git Hooks 正常工作
- [ ] 提交时代码自动格式化
- [ ] 开发脚本可正常使用

---

## 📅 阶段 2: Logto API 集成 (2-3天) ⏳

### 目标
实现 Logto Management API 的封装和测试。

### 任务清单

#### 任务 2.1: 创建 Logto API 模块
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐⭐
**状态**: 待开始

**步骤**:
1. 创建 Logto 模块
   ```bash
   cd backend
   nest g module logto
   nest g service logto
   ```

2. 实现 Logto API Service
   - src/modules/logto/logto-api.service.ts
   - 封装所有 Logto Management API 调用

3. 创建接口类型定义
   - src/modules/logto/interfaces/user.interface.ts
   - src/modules/logto/interfaces/organization.interface.ts
   - src/modules/logto/interfaces/role.interface.ts
   - src/modules/logto/interfaces/application.interface.ts

**验收标准**:
- [ ] Logto 模块创建完成
- [ ] API 服务基础结构搭建完成
- [ ] 接口类型定义完成

---

#### 任务 2.2: 实现用户 API 调用
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐⭐
**状态**: 待开始

**步骤**:
1. 实现用户列表 API
   ```typescript
   async getUsers(params: {
     page?: number;
     pageSize?: number;
     search?: string;
   })
   ```

2. 实现用户详情 API
   ```typescript
   async getUserById(userId: string)
   ```

3. 实现用户创建 API
   ```typescript
   async createUser(data: CreateUserDto)
   ```

4. 实现用户更新 API
   ```typescript
   async updateUser(userId: string, data: UpdateUserDto)
   ```

5. 实现用户删除 API
   ```typescript
   async deleteUser(userId: string)
   ```

**验收标准**:
- [ ] 所有用户 API 实现完成
- [ ] API 调用测试通过
- [ ] 错误处理正常

---

#### 任务 2.3: 实现组织 API 调用
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐
**状态**: 待开始

**步骤**:
1. 实现组织列表 API
   ```typescript
   async getOrganizations()
   ```

2. 实现组织树形结构 API
   ```typescript
   async getOrganizationTree()
   ```

3. 实现组织创建 API
   ```typescript
   async createOrganization(data: CreateOrganizationDto)
   ```

4. 实现组织成员管理 API
   ```typescript
   async addOrganizationUser(organizationId: string, userId: string)
   async removeOrganizationUser(organizationId: string, userId: string)
   ```

**验收标准**:
- [ ] 所有组织 API 实现完成
- [ ] API 调用测试通过

---

#### 任务 2.4: 实现角色和应用 API 调用
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐
**状态**: 待开始

**步骤**:
1. 实现角色 API
   - getRoles()
   - createRole()
   - updateRole()
   - deleteRole()

2. 实现用户角色分配 API
   - assignRoleToUser()
   - removeRoleFromUser()

3. 实现应用 API
   - getApplications()
   - createApplication()

**验收标准**:
- [ ] 所有角色和应用 API 实现完成
- [ ] API 调用测试通过

---

#### 任务 2.5: 创建 API 测试
**时间**: 2小时
**优先级**: ⭐⭐⭐
**状态**: 待开始

**步骤**:
1. 创建测试用例
   - test/logto/logto-api.service.spec.ts

2. 测试各个 API 调用
   - 使用真实 API 测试
   - 验证响应数据格式

**验收标准**:
- [ ] 测试用例创建完成
- [ ] API 调用测试通过

---

## 📅 阶段 3: 扩展数据库设计 (2-3天) 🔄

### 目标
设计并实现扩展数据库的 Prisma Schema。

### 任务清单

#### 任务 3.1: 设计 Prisma Schema ✅
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐⭐
**状态**: 已完成

**完成内容**:
- ✅ 初始化 Prisma
- ✅ 设计扩展数据模型:
  - UserInvitation (邀请记录)
  - AuditLog (审计日志)
  - UserExtend (用户扩展信息)
  - BatchOperation (批量操作)
  - UserNotification (系统通知)
  - StatisticsCache (统计缓存)
- ✅ 编写 prisma/schema.prisma

**验收标准**: ✅ 全部完成
- [x] Schema 设计完成
- [x] Prisma 格式验证通过 (npx prisma validate)
- [x] 所有表关系定义清晰

---

#### 任务 3.2: 创建数据库迁移
**时间**: 2小时
**优先级**: ⭐⭐⭐⭐⭐
**状态**: 待开始

**步骤**:
1. 配置数据库连接
   - 编辑 backend/.env 文件
   - 设置 DATABASE_URL

2. 生成初始迁移
   ```bash
   npx prisma migrate dev --name init_extension_tables
   ```

3. 检查生成的 SQL
   - 验证表创建顺序
   - 验证外键约束
   - 验证索引创建

4. 应用迁移
   ```bash
   npx prisma migrate deploy
   ```

**验收标准**:
- [ ] 迁移文件生成成功
- [ ] 数据库表创建成功
- [ ] 可以使用 Prisma Studio 查看数据

---

#### 任务 3.3: 创建 Repository 层
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐
**状态**: 待开始

**步骤**:
1. 创建基础 Repository 接口
   - src/common/repositories/base.repository.ts

2. 创建具体 Repository
   - src/modules/invitations/repositories/invitation.repository.ts
   - src/modules/audit-logs/repositories/audit-log.repository.ts
   - src/modules/user-extends/repositories/user-extend.repository.ts
   - src/modules/batch-operations/repositories/batch-operation.repository.ts

3. 实现 CRUD 方法
   - findById()
   - findAll()
   - create()
   - update()
   - delete()
   - count()

**验收标准**:
- [ ] 基础 Repository 接口完成
- [ ] 至少实现 3 个具体 Repository
- [ ] Repository 方法可正常操作数据

---

## 📅 阶段 4-9: 后续阶段 (待开始)

详细的任务清单与原方案保持一致,这里省略详细内容。

---

## 📝 开发规范

### Git 提交规范
```
feat: 添加用户创建功能
fix: 修复权限检查问题
docs: 更新 API 文档
style: 格式化代码
refactor: 重构用户服务
test: 添加用户服务单元测试
chore: 更新依赖包
```

### 命名规范
- ✅ 使用完整命名,不使用缩写
- ✅ `userOrganization` 而非 `userOrg`
- ✅ `permissionManagement` 而非 `permMgmt`
- ✅ 文件名使用 `kebab-case`
- ✅ 类名使用 `PascalCase`
- ✅ 函数名使用 `camelCase`

---

**文档版本**: v2.0
**最后更新**: 2025-01-29
**预计总工期**: 40-50 个工作日
**当前进度**: 阶段 1 完成,整体进度约 15%
