# Logto 用户中心管理系统 - AI 实现步骤方案

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
阶段 0: 环境准备 (1-2天)
    ↓
阶段 1: 项目初始化 (2-3天)
    ↓
阶段 2: Logto API 集成 (2-3天)
    ↓
阶段 3: 扩展数据库设计 (2-3天)
    ↓
阶段 4: 认证与授权 (2-3天)
    ↓
阶段 5: 核心功能开发 (5-7天)
    ↓
阶段 6: 扩展功能开发 (4-5天)
    ↓
阶段 7: 前端界面开发 (7-10天)
    ↓
阶段 8: 测试与优化 (3-5天)
    ↓
阶段 9: Docker 部署 (2-3天)
```

---

## 📅 阶段 0: 环境准备 (1-2天)

### 目标
搭建完整的开发环境,连接已有的数据库和服务。

### 任务清单

#### 任务 0.1: 安装开发工具
**时间**: 30分钟
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 安装 Node.js (推荐 LTS 版本 20.x)
   - 下载地址: https://nodejs.org/
   - 验证: `node --version` 应显示 v20.x.x

2. 安装 pnpm
   ```bash
   npm install -g pnpm
   ```
   - 验证: `pnpm --version`

3. 安装 Visual Studio Code
   - 安装扩展:
     - Vue - Official
     - TypeScript
     - ESLint
     - Prettier
     - Prisma
     - Tailwind CSS IntelliSense

**验收标准**:
- [ ] Node.js 版本 >= 20.0.0
- [ ] pnpm 可正常使用
- [ ] VSCode 扩展安装完成

---

#### 任务 0.2: 配置数据库连接
**时间**: 1小时
**优先级**: ⭐⭐⭐⭐⭐

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

#### 任务 0.4: 创建项目根目录
**时间**: 30分钟
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 创建项目目录结构
   ```
   logto-manager/
   ├── backend/
   ├── frontend/
   ├── docs/
   ├── deployment/
   ├── .gitignore
   └── README.md
   ```

2. 创建 README.md
   ```markdown
   # Logto 用户中心管理系统

   基于 Logto IAM 的企业级用户中心管理系统。

   ## 项目说明
   - 后端: NestJS + TypeScript
   - 前端: Nuxt 3 + Vue 3 + TypeScript
   - 数据库: MySQL/PostgreSQL (扩展数据)
   - 认证: Logto OIDC
   ```

**验收标准**:
- [ ] 项目根目录创建完成
- [ ] 所有子目录创建完成
- [ ] README.md 创建完成

---

## 📅 阶段 1: 项目初始化 (2-3天)

### 目标
创建前后端项目基础结构,配置开发工具。

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
   pnpm add @nestjs/config @nestjs/passport passport
   pnpm add @nestjs/jwt passport-jwt
   pnpm add axios @nestjs/axios
   pnpm add class-validator class-transformer
   pnpm add @prisma/client prisma
   pnpm add -D prisma
   pnpm add -D @types/passport-jwt
   ```

3. 配置 TypeScript (tsconfig.json)
   - 启用严格模式
   - 配置路径别名 (@/ 指向 src/)
   - 启用装饰器元数据

4. 配置 ESLint 和 Prettier
   ```bash
   pnpm add -D eslint prettier
   pnpm add -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
   ```

**验收标准**:
- [ ] NestJS 项目可正常启动 (pnpm run start:dev)
- [ ] 访问 http://localhost:3001 显示 "Hello World!"
- [ ] TypeScript 编译无错误
- [ ] ESLint 和 Prettier 正常工作

---

#### 任务 1.2: 配置后端基础模块
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 创建环境变量配置
   ```bash
   # .env.example
   LOGTO_MANAGEMENT_API_ENDPOINT=https://your-logto.com/api
   LOGTO_MANAGEMENT_API_KEY=your-api-key
   LOGTO_APP_ID=your-app-id
   LOGTO_APP_SECRET=your-app-secret
   LOGTO_REDIRECT_URI=http://localhost:3000/auth/callback

   DATABASE_TYPE=mysql  # 或 postgresql
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USERNAME=logto_manager
   DATABASE_PASSWORD=your-password
   DATABASE_NAME=logto_user_center_dev

   JWT_SECRET=your-jwt-secret-key
   JWT_EXPIRES_IN=7d

   APP_PORT=3001
   ```

2. 创建配置模块
   - src/config/app.config.ts
   - src/config/database.config.ts
   - src/config/logto.config.ts
   - src/config/index.ts

3. 创建全局异常过滤器
   - src/common/filters/all-exceptions.filter.ts
   - 统一错误响应格式

4. 创建全局响应拦截器
   - src/common/interceptors/transform.interceptor.ts
   - 统一包装响应数据

5. 创建全局验证管道
   - src/common/pipes/validation.pipe.ts

**验收标准**:
- [ ] 环境变量可正常读取
- [ ] 全局异常拦截器正常工作
- [ ] 响应格式统一: `{ success, message, data, timestamp }`
- [ ] DTO 验证正常工作

---

#### 任务 1.3: 初始化前端项目 (Nuxt 3)
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
   pnpm add @nuxt/ui
   pnpm add @pinia/nuxt
   pnpm add @iconify-json/heroicons @iconify-json/mdi
   pnpm add vee-validate yup
   pnpm add dayjs
   ```

3. 配置 nuxt.config.ts
   ```typescript
   export default defineNuxtConfig({
     modules: [
       '@nuxt/ui',
       '@pinia/nuxt',
     ],

     typescript: {
       strict: true,
       typeCheck: true,
     },

     imports: {
       dirs: ['composables', 'utils', 'types'],
     },
   })
   ```

4. 配置 Tailwind CSS
   - 创建 tailwind.config.ts
   - 自定义主题色彩

**验收标准**:
- [ ] Nuxt 项目可正常启动 (pnpm dev)
- [ ] 访问 http://localhost:3000 显示欢迎页面
- [ ] Nuxt UI 组件可正常使用
- [ ] Tailwind CSS 样式生效

---

#### 任务 1.4: 配置前端基础架构
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐

**步骤**:
1. 创建基础目录结构
   - components/common/
   - composables/
   - layouts/
   - pages/
   - stores/
   - types/
   - utils/

2. 创建 HTTP 请求工具
   - utils/request.ts
   - 封装 ofetch
   - 统一错误处理
   - 统一响应格式处理

3. 创建基础布局
   - layouts/default.vue
   - 包含顶部导航栏和侧边栏框架

4. 创建基础 Stores
   - stores/auth.ts
   - stores/app.ts

**验收标准**:
- [ ] 前端目录结构完整
- [ ] HTTP 请求工具可正常调用后端 API
- [ ] 基础布局显示正常
- [ ] Pinia stores 可正常使用

---

#### 任务 1.5: 配置开发工具和脚本
**时间**: 2小时
**优先级**: ⭐⭐⭐

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

## 📅 阶段 2: Logto API 集成 (2-3天)

### 目标
实现 Logto Management API 的封装和测试。

### 任务清单

#### 任务 2.1: 创建 Logto API 模块
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐⭐

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

## 📅 阶段 3: 扩展数据库设计 (2-3天)

### 目标
设计并实现扩展数据库的 Prisma Schema。

### 任务清单

#### 任务 3.1: 设计 Prisma Schema
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 初始化 Prisma
   ```bash
   cd backend
   pnpm prisma init
   ```

2. 设计扩展数据模型
   - UserInvitation (邀请记录)
   - AuditLog (审计日志)
   - UserExtend (用户扩展信息)
   - BatchOperation (批量操作)
   - UserNotification (系统通知)
   - StatisticsCache (统计缓存)

3. 编写 prisma/schema.prisma

**验收标准**:
- [ ] Schema 设计完成
- [ ] Prisma 格式验证通过 (npx prisma validate)
- [ ] 所有表关系定义清晰

---

#### 任务 3.2: 创建数据库迁移
**时间**: 2小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 生成初始迁移
   ```bash
   npx prisma migrate dev --name init_extension_tables
   ```

2. 检查生成的 SQL
   - 验证表创建顺序
   - 验证外键约束
   - 验证索引创建

3. 应用迁移
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

## 📅 阶段 4: 认证与授权 (2-3天)

### 目标
实现基于 Logto OIDC 的认证和授权。

### 任务清单

#### 任务 4.1: 实现 Logto OIDC 认证
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 安装依赖
   ```bash
   pnpm add @nestjs/passport passport
   pnpm add passport-jwt
   pnpm add @nestjs/jwt
   ```

2. 实现 Logto OIDC 策略
   - src/modules/auth/strategies/logto.strategy.ts

3. 实现认证路由
   - GET /auth/login - 重定向到 Logto
   - GET /auth/callback - Logto 回调
   - POST /auth/logout - 登出

**验收标准**:
- [ ] 可以重定向到 Logto 登录页
- [ ] 登录成功后正确回调
- [ ] JWT Token 正确生成

---

#### 任务 4.2: 实现 JWT 认证
**时间**: 3小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 配置 JWT 模块
   - src/modules/auth/auth.module.ts

2. 实现 JWT 策略
   - src/modules/auth/strategies/jwt.strategy.ts

3. 实现认证 Guard
   - src/common/guards/authentication.guard.ts

4. 实现当前用户装饰器
   - src/common/decorators/current-user.decorator.ts

**验收标准**:
- [ ] JWT Token 可以正确生成和验证
- [ ] 未认证请求被正确拦截
- [ ] 可以在 Controller 中获取当前用户

---

#### 任务 4.3: 实现审计日志拦截器
**时间**: 2小时
**优先级**: ⭐⭐⭐⭐

**步骤**:
1. 创建审计日志拦截器
   - src/common/interceptors/audit-log.interceptor.ts

2. 实现自动记录逻辑
   - 记录所有管理操作
   - 记录操作人和时间
   - 记录操作详情

**验收标准**:
- [ ] 拦截器正常工作
- [ ] 操作日志被正确记录

---

## 📅 阶段 5: 核心功能开发 (5-7天)

### 目标
实现用户、组织、角色、应用管理功能。

### 任务清单

#### 任务 5.1: 实现用户管理模块
**时间**: 6小时
**优先级**: ⭐⭐⭐⭐⭐

**步骤**:
1. 创建用户模块
   ```bash
   nest g module users
   nest g controller users
   nest g service users
   ```

2. 实现用户列表接口
   - 调用 Logto API 获取用户
   - 合并扩展数据库信息
   - 支持分页和搜索

3. 实现用户详情接口
   - 合并 Logto 数据和扩展数据

4. 实现用户更新接口
   - Logto 字段调用 Logto API
   - 扩展字段存数据库

**验收标准**:
- [ ] 用户列表可正常查询
- [ ] 用户详情正确显示
- [ ] 用户更新功能正常

---

#### 任务 5.2: 实现用户扩展信息模块
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐

**步骤**:
1. 创建用户扩展模块
   ```bash
   nest g module user-extends
   ```

2. 实现扩展信息 CRUD
   - 创建
   - 查询
   - 更新
   - 删除

**验收标准**:
- [ ] 可以管理用户扩展信息
- [ ] 数据正确存储到扩展数据库

---

#### 任务 5.3: 实现组织管理模块
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐

**步骤**:
1. 创建组织模块
   ```bash
   nest g module organizations
   ```

2. 实现组织树形结构
   - 从 Logto 获取组织数据
   - 构建树形结构

3. 实现组织 CRUD
   - 创建 (调用 Logto API)
   - 更新 (调用 Logto API)
   - 删除 (调用 Logto API)

**验收标准**:
- [ ] 组织树正确显示
- [ ] 组织 CRUD 功能正常

---

#### 任务 5.4: 实现角色和应用管理模块
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐

**步骤**:
1. 实现角色管理 (调用 Logto API)
2. 实现权限管理 (调用 Logto API)
3. 实现应用管理 (调用 Logto API)

**验收标准**:
- [ ] 角色管理功能正常
- [ ] 应用管理功能正常

---

## 📅 阶段 6: 扩展功能开发 (4-5天)

### 目标
实现邀请系统、审计日志等扩展功能。

### 任务清单

#### 任务 6.1: 实现邀请系统
**时间**: 6小时
**优先级**: ⭐⭐⭐⭐

**步骤**:
1. 创建邀请模块
2. 实现创建邀请功能
3. 实现邀请管理功能
4. 实现邀请接受功能

**验收标准**:
- [ ] 可以创建邀请
- [ ] 可以管理邀请状态
- [ ] 邀件链接正常工作

---

#### 任务 6.2: 实现审计日志模块
**时间**: 4小时
**优先级**: ⭐⭐⭐⭐

**步骤**:
1. 创建审计日志模块
2. 实现日志查询功能
3. 实现日志导出功能

**验收标准**:
- [ ] 操作日志被正确记录
- [ ] 可以查询和导出日志

---

#### 任务 6.3: 实现批量操作和通知模块
**时间**: 6小时
**优先级**: ⭐⭐⭐

**步骤**:
1. 实现批量导入功能
2. 实现系统通知功能
3. 实现数据统计功能

**验收标准**:
- [ ] 批量操作功能正常
- [ ] 通知系统正常工作

---

## 📅 阶段 7-9: 前端、测试、部署

(省略详细步骤,后续补充)

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

**文档版本**: v1.0
**最后更新**: 2025-01-28
**预计总工期**: 40-50 个工作日
