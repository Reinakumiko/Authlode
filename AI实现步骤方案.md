# Logto 用户中心管理系统 - AI 实现步骤方案

## 📋 方案说明

本文档是一份专门为 AI 辅助开发设计的实现步骤方案,将整个项目分解为**具体、可执行、可验证**的任务。

### 设计原则

1. **模块化**: 每个任务独立完成,可单独验证
2. **渐进式**: 从基础到高级,循序渐进
3. **可验证**: 每个步骤都有明确的验收标准
4. **可回滚**: 每个阶段都是可独立回滚的
5. **完整命名**: 严格遵守完整命名规范,不使用缩写

---

## 🎯 总体实施路线图

```
阶段 0: 环境准备 (1-2天)
    ↓
阶段 1: 项目初始化 (2-3天)
    ↓
阶段 2: 数据库设计与基础服务 (3-4天)
    ↓
阶段 3: 认证与权限系统 (4-5天)
    ↓
阶段 4: 核心业务模块 - 用户管理 (5-7天)
    ↓
阶段 5: 组织管理模块 (4-5天)
    ↓
阶段 6: 角色与权限管理模块 (4-5天)
    ↓
阶段 7: 应用管理模块 (3-4天)
    ↓
阶段 8: 扩展功能模块 (5-7天)
    ↓
阶段 9: 前端界面开发 (7-10天)
    ↓
阶段 10: Logto 集成与测试 (3-5天)
    ↓
阶段 11: 优化与部署 (3-5天)
```

---

## 📅 阶段 0: 环境准备 (1-2天)

### 目标
搭建完整的开发环境,确保所有工具和依赖正常工作。

### 任务清单

#### 任务 0.1: 安装开发工具
**时间**: 30分钟
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 安装 Node.js (推荐 LTS 版本 20.x)
   - 下载地址: https://nodejs.org/
   - 验证: `node --version` 应显示 v20.x.x
   - 验证: `npm --version` 应显示 10.x.x

2. 安装 pnpm (推荐使用 pnpm 而非 npm)
   ```bash
   npm install -g pnpm
   ```
   - 验证: `pnpm --version`

3. 安装 Docker Desktop
   - 下载地址: https://www.docker.com/products/docker-desktop/
   - 启动 Docker Desktop
   - 验证: `docker --version`

4. 安装 Visual Studio Code
   - 安装推荐扩展:
     - Vue - Official
     - TypeScript
     - ESLint
     - Prettier
     - Prisma
     - Tailwind CSS IntelliSense

**验收标准**:
- [ ] Node.js 版本 >= 20.0.0
- [ ] pnpm 可正常使用
- [ ] Docker 可正常启动
- [ ] VSCode 扩展安装完成

---

#### 任务 0.2: 配置数据库环境
**时间**: 1小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 选择数据库类型 (PostgreSQL 或 MySQL)
   - 推荐使用 PostgreSQL 15+
   - 或使用 MySQL 8.0+ / MariaDB 10.6+

2. 使用 Docker 启动数据库
   ```bash
   # PostgreSQL 示例
   docker run --name logto-postgres \
     -e POSTGRES_USER=logto \
     -e POSTGRES_PASSWORD=logto123 \
     -e POSTGRES_DB=logto_manager \
     -p 5432:5432 \
     -d postgres:15-alpine

   # MySQL 示例
   docker run --name logto-mysql \
     -e MYSQL_ROOT_PASSWORD=root123 \
     -e MYSQL_DATABASE=logto_manager \
     -e MYSQL_USER=logto \
     -e MYSQL_PASSWORD=logto123 \
     -p 3306:3306 \
     -d mysql:8.0
   ```

3. 启动 Redis
   ```bash
   docker run --name logto-redis \
     -p 6379:6379 \
     -d redis:7-alpine
   ```

4. 测试数据库连接
   - 使用数据库客户端工具 (如 DBeaver, TablePlus)
   - 连接到数据库
   - 创建测试表验证权限

**验收标准**:
- [ ] 数据库容器运行正常
- [ ] Redis 容器运行正常
- [ ] 可以通过客户端工具连接数据库
- [ ] 可以创建和删除表

---

#### 任务 0.3: 安装 Logto (本地开发环境)
**时间**: 1小时
**优先级**: ⭐⭐⭐⭐

**步骤**:
1. 使用 Docker Compose 启动 Logto
   ```bash
   # 克隆 Logto 仓库
   git clone https://github.com/logto-io/logto.git
   cd logto

   # 启动 Logto
   ./scripts/start-docker-postgres.sh
   pnpm boot
   ```

2. 访问 Logto 管理后台
   - 地址: http://localhost:3001
   - 默认管理员账号: 见控制台输出

3. 创建测试应用
   - 登录 Logto 管理后台
   - 创建一个新的 OIDC 应用
   - 获取 Client ID 和 Client Secret
   - 配置回调地址: http://localhost:3000/api/auth/callback

**验收标准**:
- [ ] Logto 服务正常运行
- [ ] 可以登录管理后台
- [ ] 创建了测试应用
- [ ] 获取了 Client ID 和 Secret

---

#### 任务 0.4: 创建项目根目录结构
**时间**: 30分钟
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 创建项目根目录
   ```bash
   mkdir logto-manager
   cd logto-manager
   ```

2. 创建基础目录结构
   ```
   logto-manager/
   ├── backend/
   ├── frontend/
   ├── docs/
   ├── deployment/
   ├── .gitignore
   └── README.md
   ```

3. 创建 README.md
   ```markdown
   # Logto 用户中心管理系统

   基于 Logto 开源社区版的企业级用户中心管理系统。

   ## 项目结构

   - backend/: NestJS 后端服务
   - frontend/: Nuxt 3 前端应用
   - docs/: 项目文档
   - deployment/: 部署配置

   ## 快速开始

   详见各子目录的 README.md
   ```

4. 创建 .gitignore
   ```
   node_modules/
   .env.local
   .env.*.local
   dist/
   .nuxt/
   *.log
   .DS_Store
   ```

**验收标准**:
- [ ] 项目根目录创建完成
- [ ] 所有子目录创建完成
- [ ] README.md 和 .gitignore 创建完成

---

## 📅 阶段 1: 项目初始化 (2-3天)

### 目标
创建前后端项目基础结构,配置开发工具和基础依赖。

### 任务清单

#### 任务 1.1: 初始化后端项目 (NestJS)
**时间**: 2小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 创建 NestJS 项目
   ```bash
   cd backend
   npx @nestjs/cli new . --package-manager pnpm
   ```

2. 安装核心依赖
   ```bash
   pnpm add @prisma/client
   pnpm add -D prisma

   pnpm add @nestjs/config
   pnpm add @nestjs/passport passport
   pnpm add @nestjs/jwt passport-jwt
   pnpm add passport-jwt
   pnpm add bcrypt
   pnpm add class-validator class-transformer

   pnpm add -D @types/bcrypt @types/passport-jwt
   ```

3. 配置 TypeScript (tsconfig.json)
   - 启用严格模式
   - 配置路径别名 (@/ 指向 src/)
   - 启用装饰器元数据

4. 配置 ESLint 和 Prettier
   - 安装 ESLint 和 Prettier
   - 配置 .eslintrc.js
   - 配置 .prettierrc

**验收标准**:
- [ ] NestJS 项目可正常启动 (npm run start:dev)
- [ ] 访问 http://localhost:3000 显示 "Hello World!"
- [ ] ESLint 和 Prettier 正常工作
- [ ] TypeScript 编译无错误

---

#### 任务 1.2: 配置后端基础模块
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 创建环境变量配置
   - 创建 .env.example
   - 创建 .env.local (不提交到 Git)

2. 创建配置模块 (src/config/)
   ```
   src/config/
   ├── app.config.ts
   ├── database.config.ts
   ├── redis.config.ts
   └── index.ts
   ```

3. 创建全局异常过滤器
   - src/common/filters/all-exceptions.filter.ts
   - 实现统一的错误响应格式

4. 创建全局响应拦截器
   - src/common/interceptors/transform.interceptor.ts
   - 统一包装响应数据

5. 创建全局验证管道
   - src/common/pipes/validation.pipe.ts
   - 使用 class-validator 自动验证

**验收标准**:
- [ ] 环境变量可正常读取
- [ ] 全局异常拦截器正常工作
- [ ] 响应格式统一: `{ success, message, data, timestamp }`
- [ ] DTO 验证正常工作

---

#### 任务 1.3: 配置 Prisma ORM
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 初始化 Prisma
   ```bash
   cd backend
   npx prisma init
   ```

2. 配置数据库连接
   - 编辑 prisma/schema.prisma
   - 设置数据库连接字符串
   - 选择数据库提供商 (postgresql 或 mysql)

3. 创建基础数据模型
   ```prisma
   // prisma/schema.prisma

   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "postgresql" // 或 "mysql"
     url      = env("DATABASE_URL")
   }

   // 基础模型 (后续扩展)
   model BaseModel {
     id        String   @id @default(cuid())
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

4. 创建 Prisma 服务
   - src/database/prisma.service.ts
   - src/database/prisma.module.ts

5. 生成 Prisma Client
   ```bash
   npx prisma generate
   ```

**验收标准**:
- [ ] Prisma 配置完成
- [ ] 可以连接到数据库
- [ ] Prisma Client 生成成功
- [ ] 可以在代码中使用 Prisma 服务

---

#### 任务 1.4: 初始化前端项目 (Nuxt 3)
**时间**: 2小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 创建 Nuxt 3 项目
   ```bash
   cd frontend
   npx nuxi init .
   pnpm install
   ```

2. 安装核心依赖
   ```bash
   # Nuxt UI (包含 Tailwind CSS)
   pnpm add @nuxt/ui

   # Pinia 状态管理
   pnpm add @pinia/nuxt

   # 图标库
   pnpm add @iconify-json/heroicons @iconify-json/mdi

   # 表单验证
   pnpm add vee-validate yup

   # 日期处理
   pnpm add dayjs
   ```

3. 配置 nuxt.config.ts
   ```typescript
   export default defineNuxtConfig({
     modules: [
       '@nuxt/ui',
       '@pinia/nuxt',
     ],

     // TypeScript 配置
     typescript: {
       strict: true,
       typeCheck: true,
     },

     // 自动导入
     imports: {
       dirs: ['composables', 'utils', 'types'],
     },
   })
   ```

4. 配置 Tailwind CSS
   - 创建 tailwind.config.ts
   - 自定义主题色彩 (参考总体方案)

**验收标准**:
- [ ] Nuxt 项目可正常启动 (pnpm dev)
- [ ] 访问 http://localhost:3000 显示欢迎页面
- [ ] Nuxt UI 组件可正常使用
- [ ] Tailwind CSS 样式生效

---

#### 任务 1.5: 配置前端基础架构
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐

**步骤**:
1. 创建基础目录结构
   ```
   frontend/
   ├── components/common/
   ├── composables/
   ├── layouts/
   ├── pages/
   ├── stores/
   ├── types/
   └── utils/
   ```

2. 创建 HTTP 请求工具
   - utils/request.ts
   - 封装 ofetch
   - 统一错误处理
   - 统一响应格式处理

3. 创建基础布局
   - layouts/default.vue
   - 包含顶部导航栏和侧边栏框架
   - 响应式布局

4. 创建基础 Stores
   - stores/auth.ts (认证状态)
   - stores/app.ts (应用状态)

**验收标准**:
- [ ] 前端目录结构完整
- [ ] HTTP 请求工具可正常调用后端 API
- [ ] 基础布局显示正常
- [ ] Pinia stores 可正常使用

---

#### 任务 1.6: 配置开发工具和脚本
**时间**: 2小时
**优先级**: ⭐⭐⭐

**步骤**:
1. 配置 Husky (Git Hooks)
   ```bash
   pnpm add -D husky lint-staged
   npx husky install
   ```

2. 配置 lint-staged
   - 在 package.json 中配置
   - 提交前自动运行 ESLint 和 Prettier

3. 创建开发脚本
   ```json
   {
     "scripts": {
       "dev": "concurrently \"pnpm --filter backend dev\" \"pnpm --filter frontend dev\"",
       "build": "pnpm --filter backend build && pnpm --filter frontend build",
       "lint": "pnpm --filter backend lint && pnpm --filter frontend lint",
       "format": "prettier --write \"**/*.{ts,js,vue,json,md}\""
     }
   }
   ```

4. 配置 VSCode 工作区
   - 创建 .vscode/settings.json
   - 统一编辑器配置

**验收标准**:
- [ ] Git Hooks 正常工作
- [ ] 提交时代码自动格式化
- [ ] 可以使用一个命令同时启动前后端
- [ ] VSCode 配置生效

---

## 📅 阶段 2: 数据库设计与基础服务 (3-4天)

### 目标
设计完整的数据库 Schema,实现基础数据访问层。

### 任务清单

#### 任务 2.1: 设计完整的 Prisma Schema
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 设计核心表结构
   - Account (账户表)
   - User (用户表)
   - Organization (组织表)
   - Role (角色表)
   - Permission (权限表)
   - Application (应用表)

2. 设计关联表
   - UserOrganization (用户组织关系)
   - UserRole (用户角色关系)
   - RolePermission (角色权限关系)
   - ApplicationGrant (应用授权)

3. 设计业务表
   - Invitation (邀请表)
   - AuditLog (审计日志表)
   - LoginLog (登录日志表)

4. 定义索引和约束
   - 为常查询字段添加索引
   - 定义唯一约束
   - 定义外键关系

**注意事项**:
- ✅ 使用完整字段名,如 `organizationId` 而非 `orgId`
- ✅ 使用 `createdAt` 和 `updatedAt` 时间戳
- ✅ 使用软删除 (deletedAt) 而非物理删除
- ✅ 为枚举类型定义清晰的值

**验收标准**:
- [ ] 所有表结构设计完成
- [ ] 关系定义清晰 (一对一、一对多、多对多)
- [ ] 索引定义合理
- [ ] Prisma 格式验证通过 (npx prisma validate)

---

#### 任务 2.2: 创建数据库迁移
**时间**: 2小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 生成初始迁移
   ```bash
   npx prisma migrate dev --name initial_schema
   ```

2. 检查生成的 SQL
   - 确保表创建顺序正确
   - 确保外键约束正确
   - 确保索引创建正确

3. 应用迁移到数据库
   ```bash
   npx prisma migrate deploy
   ```

4. 生成 Prisma Client
   ```bash
   npx prisma generate
   ```

**验收标准**:
- [ ] 迁移文件生成成功
- [ ] 数据库表创建成功
- [ ] 可以使用 Prisma Studio 查看数据 (npx prisma studio)
- [ ] Prisma Client 类型定义正确

---

#### 任务 2.3: 创建种子数据 (Seed Data)
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐

**步骤**:
1. 创建种子脚本
   - prisma/seed.ts
   - 创建系统管理员账户
   - 创建预置角色 (超级管理员、组织管理员等)
   - 创建预置权限
   - 创建默认组织

2. 创建预置数据
   - 角色: superAdmin, organizationAdmin, departmentManager, user, guest
   - 权限组: 用户管理、角色管理、权限管理、组织管理等
   - 权限: user:create, user:read, user:update, user:delete 等

3. 配置 package.json
   ```json
   {
     "prisma": {
       "seed": "ts-node prisma/seed.ts"
     }
   }
   ```

4. 运行种子脚本
   ```bash
   npx prisma db seed
   ```

**验收标准**:
- [ ] 种子脚本运行成功
- [ ] 创建了默认管理员账户
- [ ] 创建了预置角色和权限
- [ ] 创建了默认组织
- [ ] 可以使用管理员账户登录

---

#### 任务 2.4: 创建基础 Repository 层
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐

**步骤**:
1. 创建基础 Repository 接口
   - src/common/repositories/base.repository.ts
   - 定义通用 CRUD 方法

2. 创建具体 Repository
   - src/modules/users/repositories/user.repository.ts
   - src/modules/organizations/repositories/organization.repository.ts
   - src/modules/roles/repositories/role.repository.ts

3. 实现 Repository 方法
   - findById(id)
   - findAll(filter)
   - create(data)
   - update(id, data)
   - delete(id)
   - count(filter)

4. 添加查询辅助方法
   - 分页查询
   - 条件筛选
   - 排序
   - 关联加载

**验收标准**:
- [ ] 基础 Repository 接口定义完成
- [ ] 至少实现 3 个具体 Repository
- [ ] Repository 方法可正常查询和操作数据
- [ ] 查询逻辑清晰,易于扩展

---

#### 任务 2.5: 实现数据库事务管理
**时间**: 2小时
**优先级**: ⭐⭐⭐

**步骤**:
1. 创建事务管理器
   - src/database/transaction.manager.ts
   - 封装 Prisma 事务

2. 实现事务装饰器
   - src/common/decorators/transaction.decorator.ts
   - 自动处理事务提交和回滚

3. 创建事务使用示例
   - 在 Service 层使用事务
   - 处理嵌套事务

**验收标准**:
- [ ] 事务管理器可正常工作
- [ ] 事务失败时正确回滚
- [ ] 事务成功时正确提交
- [ ] 支持嵌套事务

---

## 📅 阶段 3: 认证与权限系统 (4-5天)

### 目标
实现基于 Logto 的认证系统和 RBAC 权限系统。

### 任务清单

#### 任务 3.1: 实现 Logto OIDC 集成
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 安装 Logto SDK
   ```bash
   pnpm add @logto/js
   pnpm add @nestjs/passport passport
   ```

2. 配置 Logto 连接
   - src/config/logto.config.ts
   - 配置 endpoint, appId, appSecret

3. 实现 OIDC 认证策略
   - src/modules/auth/strategies/logto.strategy.ts
   - 使用 Passport 实现 OIDC 流程

4. 实现认证路由
   - GET /auth/login - 重定向到 Logto 登录页
   - GET /auth/callback - Logto 回调处理
   - POST /auth/logout - 登出

**验收标准**:
- [ ] 可以重定向到 Logto 登录页
- [ ] 登录成功后正确回调
- [ ] 可以获取用户信息
- [ ] JWT Token 正确生成

---

#### 任务 3.2: 实现 JWT 认证
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 配置 JWT 模块
   - src/modules/auth/auth.module.ts
   - 配置 JWT secret 和过期时间

2. 实现 JWT 策略
   - src/modules/auth/strategies/jwt.strategy.ts
   - 验证 JWT Token
   - 提取用户信息

3. 实现认证 Guard
   - src/common/guards/authentication.guard.ts
   - 验证请求是否携带有效 Token

4. 实现当前用户装饰器
   - src/common/decorators/current-user.decorator.ts
   - 方便在 Controller 中获取当前用户

**验收标准**:
- [ ] JWT Token 可以正确生成
- [ ] JWT Token 可以正确验证
- [ ] 未认证请求被正确拦截
- [ ] 可以在 Controller 中获取当前用户

---

#### 任务 3.3: 实现 RBAC 权限系统
**时间**: 6小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 创建权限服务
   - src/modules/permissions/permissions.service.ts
   - 实现权限检查逻辑
   - 支持用户-角色-权限关联

2. 实现权限 Guard
   - src/common/guards/authorization.guard.ts
   - 检查用户是否有指定权限

3. 实现权限装饰器
   - src/common/decorators/require-permissions.decorator.ts
   - 使用示例: @RequirePermissions('user:create')

4. 实现权限缓存
   - 使用 Redis 缓存用户权限
   - 提高性能

**验收标准**:
- [ ] 可以正确检查用户权限
- [ ] 权限不足时返回 403 错误
- [ ] 权限装饰器正常工作
- [ ] 权限缓存正常工作

---

#### 任务 3.4: 实现数据权限控制
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐

**步骤**:
1. 定义数据权限范围
   - 全部数据 (ALL)
   - 本组织及下级 (ORG_AND_CHILDREN)
   - 本组织 (ORG_ONLY)
   - 本部门 (DEPARTMENT_ONLY)
   - 仅本人 (SELF_ONLY)

2. 实现数据权限服务
   - src/modules/permissions/data-permission.service.ts
   - 根据用户角色计算可访问的数据范围

3. 创建数据权限拦截器
   - src/common/interceptors/data-permission.interceptor.ts
   - 自动过滤查询结果

**验收标准**:
- [ ] 可以正确计算用户数据权限范围
- [ ] 查询结果正确过滤
- [ ] 不同用户看到不同的数据
- [ ] 超级管理员可以看到所有数据

---

#### 任务 3.5: 实现审计日志
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐

**步骤**:
1. 创建审计日志服务
   - src/modules/audit-logs/audit-logs.service.ts
   - 记录用户操作
   - 记录系统操作

2. 创建审计日志装饰器
   - src/common/decorators/audit-log.decorator.ts
   - 使用示例: @AuditLog('user.create')

3. 创建审计日志拦截器
   - src/common/interceptors/audit-log.interceptor.ts
   - 自动记录操作日志

**验收标准**:
- [ ] 关键操作被正确记录
- [ ] 日志包含用户、时间、操作类型、详细信息
- [ ] 可以查询审计日志
- [ ] 可以导出审计日志

---

## 📅 阶段 4: 核心业务模块 - 用户管理 (5-7天)

### 目标
实现完整的用户管理功能,包括用户 CRUD、用户组织关系、用户角色分配等。

### 任务清单

#### 任务 4.1: 实现用户列表和查询
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 创建用户查询 DTO
   - src/modules/users/dto/query-user.dto.ts
   - 支持分页、排序、筛选

2. 实现用户列表接口
   - GET /api/users
   - 支持多条件查询
   - 支持分页

3. 实现用户搜索
   - 按姓名搜索
   - 按邮箱搜索
   - 按手机号搜索
   - 按组织筛选

**验收标准**:
- [ ] 可以获取用户列表
- [ ] 分页功能正常
- [ ] 搜索功能正常
- [ ] 筛选功能正常

---

#### 任务 4.2: 实现用户创建和更新
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 创建用户 DTO
   - src/modules/users/dto/create-user.dto.ts
   - src/modules/users/dto/update-user.dto.ts
   - 添加验证规则

2. 实现用户创建接口
   - POST /api/users
   - 验证输入数据
   - 创建账户和用户
   - 同步到 Logto

3. 实现用户更新接口
   - PUT /api/users/:id
   - 验证权限
   - 更新用户信息
   - 同步到 Logto

**验收标准**:
- [ ] 可以创建用户
- [ ] 可以更新用户
- [ ] 数据验证正常工作
- [ ] 与 Logto 同步正常

---

#### 任务 4.3: 实现用户删除和状态管理
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐

**步骤**:
1. 实现用户删除接口
   - DELETE /api/users/:id
   - 软删除 (设置 deletedAt)
   - 检查是否可以删除

2. 实现用户状态管理
   - POST /api/users/:id/activate
   - POST /api/users/:id/deactivate
   - POST /api/users/:id/lock
   - POST /api/users/:id/unlock

**验收标准**:
- [ ] 可以删除用户
- [ ] 删除是软删除
- [ ] 可以激活/停用用户
- [ ] 可以锁定/解锁用户

---

#### 任务 4.4: 实现用户组织关系管理
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 实现添加用户到组织
   - POST /api/users/:id/organizations
   - 设置主组织
   - 设置职位

2. 实现移除用户组织
   - DELETE /api/users/:id/organizations/:organizationId

3. 实现获取用户组织列表
   - GET /api/users/:id/organizations

**验收标准**:
- [ ] 可以添加用户到组织
- [ ] 可以移除用户组织
- [ ] 可以设置主组织
- [ ] 可以查看用户组织列表

---

#### 任务 4.5: 实现用户角色分配
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 实现分配角色给用户
   - POST /api/users/:id/roles
   - 支持批量分配
   - 设置过期时间

2. 实现移除用户角色
   - DELETE /api/users/:id/roles/:roleId

3. 实现获取用户角色列表
   - GET /api/users/:id/roles

4. 实现获取用户权限列表
   - GET /api/users/:id/permissions

**验收标准**:
- [ ] 可以为用户分配角色
- [ ] 可以移除用户角色
- [ ] 可以设置角色过期时间
- [ ] 可以查看用户所有权限

---

#### 任务 4.6: 实现用户导入导出
**时间**: 4小时
**优先级**: ⭐⭐⭐

**步骤**:
1. 实现用户导出
   - GET /api/users/export
   - 支持导出为 CSV
   - 支持导出为 Excel

2. 实现用户导入
   - POST /api/users/import
   - 上传 CSV/Excel 文件
   - 验证数据格式
   - 批量创建用户

**验收标准**:
- [ ] 可以导出用户数据
- [ ] 可以导入用户数据
- [ ] 导入时数据验证正常
- [ ] 导入失败时提供详细错误信息

---

## 📅 阶段 5: 组织管理模块 (4-5天)

### 任务清单

#### 任务 5.1: 实现组织树形结构
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 实现获取组织树接口
   - GET /api/organizations/tree
   - 返回完整树形结构

2. 实现组织路径管理
   - 创建组织时自动设置 path
   - 移动组织时更新 path

**验收标准**:
- [ ] 可以获取组织树
- [ ] 树形结构正确
- [ ] 支持无限层级

---

#### 任务 5.2: 实现组织 CRUD
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 实现创建组织
   - POST /api/organizations
   - 选择父组织

2. 实现更新组织
   - PUT /api/organizations/:id

3. 实现删除组织
   - DELETE /api/organizations/:id
   - 检查是否有子组织
   - 检查是否有成员

**验收标准**:
- [ ] 可以创建组织
- [ ] 可以更新组织
- [ ] 可以删除空组织
- [ ] 不能删除有子组织或成员的组织

---

#### 任务 5.3: 实现组织移动
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐

**步骤**:
1. 实现移动组织接口
   - POST /api/organizations/:id/move
   - 指定新的父组织

2. 实现移动验证
   - 不能移动到自己的子组织
   - 不能移动到自己

**验收标准**:
- [ ] 可以移动组织
- [ ] 移动后树形结构正确
- [ ] 移动验证正常工作

---

#### 任务 5.4: 实现组织成员管理
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 实现获取组织成员
   - GET /api/organizations/:id/members
   - 支持分页和筛选

2. 实现添加成员
   - POST /api/organizations/:id/members
   - 设置职位
   - 设置管理员

**验收标准**:
- [ ] 可以查看组织成员
- [ ] 可以添加成员
- [ ] 可以移除成员
- [ ] 可以设置组织管理员

---

## 📅 阶段 6: 角色与权限管理模块 (4-5天)

### 任务清单

#### 任务 6.1: 实现角色 CRUD
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 实现角色列表
   - GET /api/roles
   - 按类型和范围筛选

2. 实现创建角色
   - POST /api/roles
   - 设置角色类型
   - 设置角色范围

**验收标准**:
- [ ] 可以查看角色列表
- [ ] 可以创建角色
- [ ] 可以更新角色
- [ ] 可以删除自定义角色

---

#### 任务 6.2: 实现角色权限分配
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 实现为角色分配权限
   - POST /api/roles/:id/permissions
   - 批量分配权限

2. 实现获取角色权限
   - GET /api/roles/:id/permissions

**验收标准**:
- [ ] 可以为角色分配权限
- [ ] 可以查看角色权限
- [ ] 权限分配立即生效

---

#### 任务 6.3: 实现权限管理
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐

**步骤**:
1. 实现权限列表
   - GET /api/permissions
   - 按权限组分组

2. 实现创建权限
   - POST /api/permissions
   - 设置资源和操作

**验收标准**:
- [ ] 可以查看所有权限
- [ ] 可以创建权限
- [ ] 可以更新权限
- [ ] 可以删除自定义权限

---

## 📅 阶段 7-11: (简述)

### 阶段 7: 应用管理模块 (3-4天)
- 应用注册和配置
- 应用授权管理
- 应用使用统计

### 阶段 8: 扩展功能模块 (5-7天)
- 用户组管理
- 邀请系统
- 系统设置

### 阶段 9: 前端界面开发 (7-10天)
- 用户管理页面
- 组织管理页面
- 角色权限页面
- 应用管理页面

### 阶段 10: Logto 集成与测试 (3-5天)
- 完整集成 Logto
- 用户同步
- 单元测试
- 集成测试

### 阶段 11: 优化与部署 (3-5天)
- 性能优化
- 安全加固
- Docker 部署
- 文档完善

---

## 🎯 验收标准总结

### 功能验收
- [ ] 所有核心功能正常工作
- [ ] 权限控制准确
- [ ] 数据一致性保证
- [ ] 审计日志完整

### 性能验收
- [ ] API 响应时间 < 200ms (P95)
- [ ] 页面加载时间 < 2s
- [ ] 支持 1000+ 并发用户

### 安全验收
- [ ] 通过安全扫描
- [ ] 无 SQL 注入风险
- [ ] 无 XSS 漏洞
- [ ] 敏感数据加密

### 代码质量
- [ ] TypeScript 编译无错误
- [ ] ESLint 检查通过
- [ ] 单元测试覆盖率 > 80%
- [ ] 代码审查通过

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
- ✅ 完整命名,不使用缩写
- ✅ `userOrganization` 而非 `userOrg`
- ✅ `permissionManagement` 而非 `permMgmt`
- ✅ `applicationAuthorization` 而非 `appAuth`

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化
- 编写单元测试
- 添加 JSDoc 注释

---

**文档版本**: v1.0
**最后更新**: 2024-01-01
**预计总工期**: 50-70 个工作日
